import { and, count, desc, eq, gt, inArray, ne, or } from 'drizzle-orm';
import { getCineTypeBySlug } from '@/data/cinetype';
import {
  blockSchema,
  cinetestResultSchema,
  matchPoolSchema,
  matchRequestSchema,
  matchSchema,
  profileSchema,
  userMovieSchema,
} from '@/models/Schema';
import type {
  MatchAxisCell,
  MatchAxisView,
  MatchCard,
  MatchEligibility,
  PoolStatus,
  RequestMatchResult,
  RespondMatchResult,
} from '@/types/CineMatch';
import type { CineVector } from '@/types/CineTest';
import type { CineTypeSlug } from '@/types/CineType';
import { getOrCreateDirectConversation } from './Chat';
import { axisCells, MATCH_CONFIG, matchScore, sharedWatchedCount } from './CineMatchScoring';
import { db } from './DB';
import { createNotification } from './Notification';

// The matcher engine. Pool membership, requests, and the resulting matches live in the
// database; trait vectors and watched films are read live (so the pool always reflects the
// latest test and library). Scoring is delegated to the pure CineMatchScoring module; this
// file owns the queries, the candidate scan, consent, and the fallback sweep.

type MatchRow = typeof matchSchema.$inferSelect;
type MatchRequestRow = typeof matchRequestSchema.$inferSelect;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;

// One viewer's matchable state: their trait vector and the set of films they've watched.
type MatcherInput = { vector: CineVector; watched: Set<number> };

// A pool member eligible to be matched against, with everything scoring needs.
type Candidate = { id: string; vector: CineVector; watched: Set<number> };

const MATCH_PROFILE_COLUMNS = {
  id: profileSchema.id,
  handle: profileSchema.handle,
  displayName: profileSchema.displayName,
  avatarUrl: profileSchema.avatarUrl,
  country: profileSchema.country,
  cineType: profileSchema.cineType,
} as const;

type MatchProfile = {
  id: string;
  handle: string;
  displayName: string | null;
  avatarUrl: string | null;
  country: string | null;
  cineType: CineTypeSlug | null;
};

// The start of the current rolling window — requests newer than this count against the budget.
function windowStart() {
  return new Date(Date.now() - MATCH_CONFIG.windowDays * 24 * 60 * 60 * 1000);
}

// The fallback deadline for a freshly spent request: the same search horizon as the window.
function expiryFromNow() {
  return new Date(Date.now() + MATCH_CONFIG.windowDays * 24 * 60 * 60 * 1000);
}

// --- reads --------------------------------------------------------------------

// Loads a user's latest trait vector and watched-film set, or null when they have never
// finished a CineTest (no vector to score).
async function loadMatcherInput(userId: string): Promise<MatcherInput | null> {
  const [[result], watchedRows] = await Promise.all([
    db
      .select({ axisScores: cinetestResultSchema.axisScores })
      .from(cinetestResultSchema)
      .where(eq(cinetestResultSchema.userId, userId))
      .orderBy(desc(cinetestResultSchema.createdAt))
      .limit(1),
    db
      .select({ movieId: userMovieSchema.movieId })
      .from(userMovieSchema)
      .where(and(eq(userMovieSchema.userId, userId), eq(userMovieSchema.watched, true))),
  ]);

  if (!result) {
    return null;
  }

  return { vector: result.axisScores, watched: new Set(watchedRows.map((row) => row.movieId)) };
}

// Loads every active pool member except the requester that is eligible to be matched —
// has a trait vector and enough watched films — with the data scoring needs.
async function loadPoolCandidates(excludeUserId: string): Promise<Candidate[]> {
  const poolRows = await db
    .select({ userId: matchPoolSchema.userId })
    .from(matchPoolSchema)
    .where(and(eq(matchPoolSchema.isActive, true), ne(matchPoolSchema.userId, excludeUserId)));

  const poolIds = poolRows.map((row) => row.userId);

  if (poolIds.length === 0) {
    return [];
  }

  const [vectorRows, watchedRows] = await Promise.all([
    db
      .selectDistinctOn([cinetestResultSchema.userId], {
        userId: cinetestResultSchema.userId,
        axisScores: cinetestResultSchema.axisScores,
      })
      .from(cinetestResultSchema)
      .where(inArray(cinetestResultSchema.userId, poolIds))
      .orderBy(cinetestResultSchema.userId, desc(cinetestResultSchema.createdAt)),
    db
      .select({ userId: userMovieSchema.userId, movieId: userMovieSchema.movieId })
      .from(userMovieSchema)
      .where(and(inArray(userMovieSchema.userId, poolIds), eq(userMovieSchema.watched, true))),
  ]);

  const vectorById = new Map(vectorRows.map((row) => [row.userId, row.axisScores]));
  const watchedById = new Map<string, Set<number>>();

  for (const row of watchedRows) {
    const set = watchedById.get(row.userId) ?? new Set<number>();
    set.add(row.movieId);
    watchedById.set(row.userId, set);
  }

  const candidates: Candidate[] = [];

  for (const id of poolIds) {
    const vector = vectorById.get(id);
    const watched = watchedById.get(id) ?? new Set<number>();

    if (vector && watched.size >= MATCH_CONFIG.minWatched) {
      candidates.push({ id, vector, watched });
    }
  }

  return candidates;
}

// The candidate ids the requester can't be paired with: anyone blocking or blocked by them,
// and anyone they already share a match with (a pair is introduced at most once).
async function relatedIds(userId: string): Promise<Set<string>> {
  const [blocks, matches] = await Promise.all([
    db
      .select({ blockerId: blockSchema.blockerId, blockedId: blockSchema.blockedId })
      .from(blockSchema)
      .where(or(eq(blockSchema.blockerId, userId), eq(blockSchema.blockedId, userId))),
    db
      .select({ userAId: matchSchema.userAId, userBId: matchSchema.userBId })
      .from(matchSchema)
      .where(or(eq(matchSchema.userAId, userId), eq(matchSchema.userBId, userId))),
  ]);

  const excluded = new Set<string>();

  for (const row of blocks) {
    excluded.add(row.blockerId === userId ? row.blockedId : row.blockerId);
  }

  for (const row of matches) {
    excluded.add(row.userAId === userId ? row.userBId : row.userAId);
  }

  return excluded;
}

// Scores every candidate against the requester, strongest first.
function scoreCandidates(requester: MatcherInput, candidates: Candidate[]) {
  return candidates
    .map((candidate) => {
      const shared = sharedWatchedCount(requester.watched, candidate.watched);
      const score = matchScore({ vectorA: requester.vector, vectorB: candidate.vector, shared });

      return { candidate, score, shared };
    })
    .toSorted((a, b) => b.score - a.score);
}

// --- match creation -----------------------------------------------------------

// Persists a match for a pair, snapshotting the score and the per-axis breakdown oriented to
// the sorted ids. Returns null when the pair already has a match (unique pairKey).
async function createMatch(props: {
  requesterId: string;
  requester: MatcherInput;
  candidate: Candidate;
  score: number;
  shared: number;
  isFallback: boolean;
  requestId: string;
}): Promise<MatchRow | null> {
  const requesterIsLower = props.requesterId < props.candidate.id;
  const userAId = requesterIsLower ? props.requesterId : props.candidate.id;
  const userBId = requesterIsLower ? props.candidate.id : props.requesterId;
  const vectorA = requesterIsLower ? props.requester.vector : props.candidate.vector;
  const vectorB = requesterIsLower ? props.candidate.vector : props.requester.vector;

  const [created] = await db
    .insert(matchSchema)
    .values({
      pairKey: `${userAId}:${userBId}`,
      userAId,
      userBId,
      score: props.score,
      axisDeltas: axisCells(vectorA, vectorB),
      sharedWatched: props.shared,
      isFallback: props.isFallback,
      requestId: props.requestId,
    })
    .onConflictDoNothing({ target: matchSchema.pairKey })
    .returning();

  return created ?? null;
}

// Runs the matcher for one request: scans the pool, and if the best candidate clears the bar
// (or `allowFallback` is set, taking the closest), creates the match, fulfills the request,
// and pages the candidate. Returns the match, or null when nothing qualifies.
async function attemptMatch(props: {
  request: MatchRequestRow;
  allowFallback: boolean;
}): Promise<MatchRow | null> {
  const { requesterId } = props.request;
  const requester = await loadMatcherInput(requesterId);

  if (!requester) {
    return null;
  }

  const candidates = await loadPoolCandidates(requesterId);
  const excluded = await relatedIds(requesterId);
  const eligible = candidates.filter((candidate) => !excluded.has(candidate.id));

  if (eligible.length === 0) {
    return null;
  }

  const [best] = scoreCandidates(requester, eligible);

  if (!best || (!props.allowFallback && best.score < MATCH_CONFIG.threshold)) {
    return null;
  }

  const match = await createMatch({
    requesterId,
    requester,
    candidate: best.candidate,
    score: best.score,
    shared: best.shared,
    isFallback: best.score < MATCH_CONFIG.threshold,
    requestId: props.request.id,
  });

  if (!match) {
    return null;
  }

  await db
    .update(matchRequestSchema)
    .set({ status: 'fulfilled', matchId: match.id })
    .where(eq(matchRequestSchema.id, props.request.id));

  await createNotification({
    userId: best.candidate.id,
    actorId: requesterId,
    type: 'match_found',
    matchId: match.id,
  });

  return match;
}

// --- pool ---------------------------------------------------------------------

// Resolves whether a user may join the pool: they must have finished the CineTest and marked
// enough films watched.
async function loadEligibility(userId: string): Promise<MatchEligibility> {
  const [[profile], [watched]] = await Promise.all([
    db
      .select({ cineType: profileSchema.cineType })
      .from(profileSchema)
      .where(eq(profileSchema.id, userId))
      .limit(1),
    db
      .select({ value: count() })
      .from(userMovieSchema)
      .where(and(eq(userMovieSchema.userId, userId), eq(userMovieSchema.watched, true))),
  ]);

  const hasCineType = Boolean(profile?.cineType);
  const watchedCount = watched?.value ?? 0;

  return {
    hasCineType,
    watchedCount,
    minWatched: MATCH_CONFIG.minWatched,
    isEligible: hasCineType && watchedCount >= MATCH_CONFIG.minWatched,
  };
}

/**
 * Loads the pool status card: membership, eligibility, the rolling request budget, and any
 * in-flight searches with their fallback deadlines.
 * @param userId - The Clerk user id.
 * @returns The full pool status for the dashboard.
 */
export async function getPoolStatus(userId: string): Promise<PoolStatus> {
  const [[pool], eligibility, [spent], searches] = await Promise.all([
    db.select().from(matchPoolSchema).where(eq(matchPoolSchema.userId, userId)).limit(1),
    loadEligibility(userId),
    db
      .select({ value: count() })
      .from(matchRequestSchema)
      .where(
        and(
          eq(matchRequestSchema.requesterId, userId),
          gt(matchRequestSchema.createdAt, windowStart()),
        ),
      ),
    db
      .select({
        id: matchRequestSchema.id,
        createdAt: matchRequestSchema.createdAt,
        expiresAt: matchRequestSchema.expiresAt,
      })
      .from(matchRequestSchema)
      .where(
        and(eq(matchRequestSchema.requesterId, userId), eq(matchRequestSchema.status, 'searching')),
      )
      .orderBy(desc(matchRequestSchema.createdAt)),
  ]);

  const used = spent?.value ?? 0;

  return {
    isInPool: pool?.isActive ?? false,
    joinedAt: pool?.joinedAt ?? null,
    refreshedAt: pool?.refreshedAt ?? null,
    eligibility,
    requestsLeft: Math.max(0, MATCH_CONFIG.requestsPerWindow - used),
    requestsTotal: MATCH_CONFIG.requestsPerWindow,
    windowDays: MATCH_CONFIG.windowDays,
    activeSearches: searches,
  };
}

/**
 * Adds the user to the matching pool (or re-activates and refreshes their membership), once
 * they are eligible.
 * @param userId - The Clerk user id.
 * @returns Whether the user is now in the pool.
 */
export async function joinPool(userId: string): Promise<{ ok: boolean }> {
  const eligibility = await loadEligibility(userId);

  if (!eligibility.isEligible) {
    return { ok: false };
  }

  const now = new Date();

  await db
    .insert(matchPoolSchema)
    .values({ userId, isActive: true, refreshedAt: now })
    .onConflictDoUpdate({
      target: matchPoolSchema.userId,
      set: { isActive: true, refreshedAt: now },
    });

  return { ok: true };
}

/**
 * Removes the user from the pool immediately. Existing matches are untouched.
 * @param userId - The Clerk user id.
 */
export async function leavePool(userId: string) {
  await db
    .update(matchPoolSchema)
    .set({ isActive: false })
    .where(eq(matchPoolSchema.userId, userId));
}

// --- requests -----------------------------------------------------------------

/**
 * Spends one weekly request: records it, then scans the pool for someone who clears the
 * threshold. A hit creates a pending match and pages them; otherwise the request keeps
 * searching until the sweep promotes a fallback at the horizon.
 * @param userId - The Clerk user id spending the request.
 * @returns A guard failure, or success with whether a match was made immediately.
 */
export async function requestMatch(userId: string): Promise<RequestMatchResult> {
  const status = await getPoolStatus(userId);

  if (!status.eligibility.isEligible) {
    return { ok: false, reason: 'not_eligible' };
  }

  if (!status.isInPool) {
    return { ok: false, reason: 'not_in_pool' };
  }

  if (status.requestsLeft <= 0) {
    return { ok: false, reason: 'no_requests_left' };
  }

  const [request] = await db
    .insert(matchRequestSchema)
    .values({ requesterId: userId, expiresAt: expiryFromNow() })
    .returning();

  if (!request) {
    return { ok: false, reason: 'no_requests_left' };
  }

  const match = await attemptMatch({ request, allowFallback: false });

  return { ok: true, matched: Boolean(match), matchId: match?.id ?? null };
}

// Re-evaluates one searching request: fulfills it if a candidate now clears the bar, promotes
// the closest as a fallback once past the horizon, or leaves it searching.
async function processSearchingRequest(
  request: MatchRequestRow,
  now: Date,
): Promise<'fulfilled' | 'expired' | 'searching'> {
  const allowFallback = request.expiresAt <= now;
  const match = await attemptMatch({ request, allowFallback });

  if (match) {
    return 'fulfilled';
  }

  if (allowFallback) {
    await db
      .update(matchRequestSchema)
      .set({ status: 'expired' })
      .where(eq(matchRequestSchema.id, request.id));

    return 'expired';
  }

  return 'searching';
}

/**
 * Re-evaluates every searching request against the current pool, fulfilling any that now
 * clear the bar and promoting a fallback for those past their horizon. Meant to run on a
 * schedule (the protected sweep endpoint).
 * @returns How many requests were fulfilled and how many expired with no candidate.
 */
export async function sweepMatchRequests(): Promise<{ fulfilled: number; expired: number }> {
  const now = new Date();
  const requests = await db
    .select()
    .from(matchRequestSchema)
    .where(eq(matchRequestSchema.status, 'searching'));

  let fulfilled = 0;
  let expired = 0;

  for (const request of requests) {
    const outcome = await processSearchingRequest(request, now);

    if (outcome === 'fulfilled') {
      fulfilled += 1;
    } else if (outcome === 'expired') {
      expired += 1;
    }
  }

  return { fulfilled, expired };
}

/**
 * Sweeps only the given user's searching requests — the cheap, opportunistic pass run when
 * they open their matches dashboard, so an active user sees a fresh match or fallback without
 * waiting on the scheduled sweep.
 * @param userId - The Clerk user id whose requests to re-evaluate.
 */
export async function sweepUserRequests(userId: string) {
  const now = new Date();
  const requests = await db
    .select()
    .from(matchRequestSchema)
    .where(
      and(eq(matchRequestSchema.requesterId, userId), eq(matchRequestSchema.status, 'searching')),
    );

  for (const request of requests) {
    await processSearchingRequest(request, now);
  }
}

// --- consent ------------------------------------------------------------------

// Connects a match once both sides have accepted: opens the direct conversation and pages the
// other party. Guards against a double-connect race so only the first writer notifies.
async function connectMatch(props: {
  matchId: string;
  userId: string;
  otherId: string;
}): Promise<string | null> {
  const conversationId = await getOrCreateDirectConversation({
    userId: props.userId,
    targetId: props.otherId,
  });

  const [connected] = await db
    .update(matchSchema)
    .set({ status: 'connected', conversationId })
    .where(and(eq(matchSchema.id, props.matchId), eq(matchSchema.status, 'pending')))
    .returning({ id: matchSchema.id });

  if (connected) {
    await createNotification({
      userId: props.otherId,
      actorId: props.userId,
      type: 'match_connected',
      matchId: props.matchId,
    });

    return conversationId;
  }

  const [current] = await db
    .select({ conversationId: matchSchema.conversationId })
    .from(matchSchema)
    .where(eq(matchSchema.id, props.matchId))
    .limit(1);

  return current?.conversationId ?? conversationId;
}

// Records the viewer's acceptance and connects the match when the other side has already
// accepted too. A no-op when the match is no longer pending.
async function acceptMatch(props: {
  match: MatchRow;
  userId: string;
  otherId: string;
  isA: boolean;
}): Promise<RespondMatchResult> {
  if (props.match.status === 'connected') {
    return { ok: true, connected: true, conversationId: props.match.conversationId };
  }

  if (props.match.status !== 'pending') {
    return { ok: false, connected: false, conversationId: null };
  }

  await db
    .update(matchSchema)
    .set(props.isA ? { consentA: 'accepted' } : { consentB: 'accepted' })
    .where(and(eq(matchSchema.id, props.match.id), eq(matchSchema.status, 'pending')));

  const [fresh] = await db
    .select()
    .from(matchSchema)
    .where(eq(matchSchema.id, props.match.id))
    .limit(1);

  const bothAccepted =
    fresh?.status === 'pending' && fresh.consentA === 'accepted' && fresh.consentB === 'accepted';

  if (!bothAccepted) {
    return {
      ok: true,
      connected: fresh?.status === 'connected',
      conversationId: fresh?.conversationId ?? null,
    };
  }

  const conversationId = await connectMatch({
    matchId: props.match.id,
    userId: props.userId,
    otherId: props.otherId,
  });

  return { ok: true, connected: true, conversationId };
}

/**
 * Responds to a match: accepting connects it when both sides agree (opening chat); declining
 * closes it silently, with no notification to the other party.
 * @param props - The acting user id, the match id, and the decision.
 * @returns Whether the action took, whether the match connected, and the conversation if so.
 */
export async function respondToMatch(props: {
  userId: string;
  matchId: string;
  decision: 'accept' | 'decline';
}): Promise<RespondMatchResult> {
  const [match] = await db
    .select()
    .from(matchSchema)
    .where(
      and(
        eq(matchSchema.id, props.matchId),
        or(eq(matchSchema.userAId, props.userId), eq(matchSchema.userBId, props.userId)),
      ),
    )
    .limit(1);

  if (!match) {
    return { ok: false, connected: false, conversationId: null };
  }

  const isA = match.userAId === props.userId;
  const otherId = isA ? match.userBId : match.userAId;

  if (props.decision === 'decline') {
    if (match.status === 'pending') {
      await db
        .update(matchSchema)
        .set(
          isA
            ? { consentA: 'declined', status: 'closed' }
            : { consentB: 'declined', status: 'closed' },
        )
        .where(and(eq(matchSchema.id, props.matchId), eq(matchSchema.status, 'pending')));
    }

    return { ok: true, connected: false, conversationId: null };
  }

  return await acceptMatch({ match, userId: props.userId, otherId, isA });
}

// --- match cards --------------------------------------------------------------

// Re-orients a stored A/B axis snapshot to the viewer's perspective.
function orientAxes(cells: MatchAxisCell[], isA: boolean): MatchAxisView[] {
  return cells.map((cell) => ({
    axis: cell.axis,
    minePole: isA ? cell.aPole : cell.bPole,
    theirPole: isA ? cell.bPole : cell.aPole,
    delta: cell.delta,
  }));
}

// Builds a viewer-oriented match card, redacting the other party's avatar/handle until the
// match is connected (display name + CineType + city are all that show before).
function toCard(row: MatchRow, userId: string, profile: MatchProfile): MatchCard {
  const isA = row.userAId === userId;
  const connected = row.status === 'connected';

  return {
    id: row.id,
    status: row.status,
    score: row.score,
    isFallback: row.isFallback,
    sharedWatched: row.sharedWatched,
    axes: orientAxes(row.axisDeltas, isA),
    myConsent: isA ? row.consentA : row.consentB,
    theirConsent: isA ? row.consentB : row.consentA,
    conversationId: connected ? row.conversationId : null,
    other: {
      displayName: profile.displayName,
      cineType: profile.cineType,
      cineTypeCode: profile.cineType ? (getCineTypeBySlug(profile.cineType)?.code ?? null) : null,
      country: profile.country,
      handle: connected ? profile.handle : null,
      avatarUrl: connected ? profile.avatarUrl : null,
    },
    createdAt: row.createdAt,
  };
}

/**
 * Lists a user's open matches (pending and connected, never closed), newest first, each
 * oriented to the viewer with the other party redacted until connection.
 * @param userId - The Clerk user id.
 * @returns The viewer's match cards.
 */
export async function listMatches(userId: string): Promise<MatchCard[]> {
  const rows = await db
    .select()
    .from(matchSchema)
    .where(
      and(
        or(eq(matchSchema.userAId, userId), eq(matchSchema.userBId, userId)),
        ne(matchSchema.status, 'closed'),
      ),
    )
    .orderBy(desc(matchSchema.createdAt));

  if (rows.length === 0) {
    return [];
  }

  const otherIds = rows.map((row) => (row.userAId === userId ? row.userBId : row.userAId));
  const profiles = await db
    .select(MATCH_PROFILE_COLUMNS)
    .from(profileSchema)
    .where(inArray(profileSchema.id, otherIds));

  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));

  return rows.flatMap((row) => {
    const otherId = row.userAId === userId ? row.userBId : row.userAId;
    const profile = profileById.get(otherId);

    return profile ? [toCard(row, userId, profile)] : [];
  });
}

/**
 * Loads a single match the viewer participates in, oriented to them, for the anatomy page.
 * @param props - The acting user id and the match id.
 * @returns The match card, or null when the match is missing or not theirs.
 */
export async function getMatch(props: {
  userId: string;
  matchId: string;
}): Promise<MatchCard | null> {
  // The match id arrives from an untrusted route param; a malformed uuid would make pg throw.
  if (!UUID_PATTERN.test(props.matchId)) {
    return null;
  }

  const [row] = await db
    .select()
    .from(matchSchema)
    .where(
      and(
        eq(matchSchema.id, props.matchId),
        or(eq(matchSchema.userAId, props.userId), eq(matchSchema.userBId, props.userId)),
      ),
    )
    .limit(1);

  if (!row) {
    return null;
  }

  const otherId = row.userAId === props.userId ? row.userBId : row.userAId;
  const [profile] = await db
    .select(MATCH_PROFILE_COLUMNS)
    .from(profileSchema)
    .where(eq(profileSchema.id, otherId))
    .limit(1);

  return profile ? toCard(row, props.userId, profile) : null;
}
