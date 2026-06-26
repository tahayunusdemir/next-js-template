// Type model for CineMatch — taste-based pairing layered on the CineTest vector and the
// films a viewer has marked watched. Matching pairs two pool members on their disposition
// axes (70%) and their shared watched films (30%); an introduction only surfaces once it
// clears the similarity threshold. Display copy lives in next-intl; this layer holds the
// structural keys and the shapes shared between the scorer, the lib, and the UI.

import type { CineTypeSlug } from '@/types/CineType';

/**
 * The four disposition axes that drive the match anatomy breakdown — the same axes that
 * resolve the CineType code. The four texture axes still feed the personality score, but
 * the human-readable breakdown stays at four rows (see the CineMatch spec).
 */
export type CineMatchAxis = 'gaze' | 'eye' | 'pulse' | 'compass';

export const CINE_MATCH_AXES: readonly CineMatchAxis[] = ['gaze', 'eye', 'pulse', 'compass'];

/**
 * The single CineType pole letter a viewer leans to on a disposition axis. Kept a literal
 * union (not `string`) so the strict next-intl `t()` accepts keys built from it, e.g.
 * `pole_${CinePoleLetter}`.
 */
export type CinePoleLetter = 'S' | 'C' | 'V' | 'R' | 'H' | 'M' | 'A' | 'F';

/** A match request's lifecycle: searching the pool, fulfilled with a match, or expired. */
export type MatchRequestStatus = 'searching' | 'fulfilled' | 'expired';

/** One side's stance on a match. Chat unlocks only when both sides reach `accepted`. */
export type ConsentState = 'pending' | 'accepted' | 'declined';

/** A match's lifecycle: offered, both opted in, or closed (declined or expired). */
export type MatchStatus = 'pending' | 'connected' | 'closed';

/**
 * One axis row of a match snapshot, oriented to the sorted pair (a = first user id). Each
 * pole is the single CineType letter the viewer leans to on that axis; `delta` is the gap
 * on a 0–10 scale (smaller = closer). Stored verbatim so the displayed score never drifts
 * when a participant later retakes the test.
 */
export type MatchAxisCell = {
  axis: CineMatchAxis;
  aPole: CinePoleLetter;
  bPole: CinePoleLetter;
  delta: number;
};

/** One axis row oriented to the viewer, for rendering the anatomy card. */
export type MatchAxisView = {
  axis: CineMatchAxis;
  minePole: CinePoleLetter;
  theirPole: CinePoleLetter;
  delta: number;
};

/** The other party in a match, redacted before connection (no avatar/handle until both opt in). */
type MatchParticipant = {
  displayName: string | null;
  cineType: CineTypeSlug | null;
  /** The CineType's four-letter code (e.g. "CVHF"), resolved for display. */
  cineTypeCode: string | null;
  country: string | null;
  // Only populated once the match is connected (mutual consent).
  handle: string | null;
  avatarUrl: string | null;
};

/** A match as shown on the dashboard, oriented to the viewer. */
export type MatchCard = {
  id: string;
  status: MatchStatus;
  score: number;
  isFallback: boolean;
  sharedWatched: number;
  axes: MatchAxisView[];
  myConsent: ConsentState;
  theirConsent: ConsentState;
  conversationId: string | null;
  other: MatchParticipant;
  createdAt: Date;
};

/** An in-flight request still searching the pool, with its fallback deadline. */
type ActiveSearch = {
  id: string;
  createdAt: Date;
  expiresAt: Date;
};

/** Whether a user may join the pool, and what is still missing if not. */
export type MatchEligibility = {
  hasCineType: boolean;
  watchedCount: number;
  minWatched: number;
  isEligible: boolean;
};

/** The pool status card: membership, eligibility, and the rolling request budget. */
export type PoolStatus = {
  isInPool: boolean;
  joinedAt: Date | null;
  refreshedAt: Date | null;
  eligibility: MatchEligibility;
  requestsLeft: number;
  requestsTotal: number;
  windowDays: number;
  activeSearches: ActiveSearch[];
};

/** Result of spending a request: a guard failure, an instant match, or a pending search. */
export type RequestMatchResult =
  | { ok: false; reason: 'not_eligible' | 'not_in_pool' | 'no_requests_left' }
  | { ok: true; matched: boolean; matchId: string | null };

/** Result of responding to a match: whether it connected, and the conversation when it did. */
export type RespondMatchResult = {
  ok: boolean;
  connected: boolean;
  conversationId: string | null;
};
