import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import type {
  ConsentState,
  MatchAxisCell,
  MatchRequestStatus,
  MatchStatus,
} from '@/types/CineMatch';
import type { CineAnswerMap, CineDescriptorKey, CineFilmPicks, CineVector } from '@/types/CineTest';
import type { CineTypeSlug } from '@/types/CineType';
import type {
  CommunityCategorySlug,
  CommunityReportReason,
  CommunityTarget,
} from '@/types/Community';
import type { NotificationType } from '@/types/Notification';

// This file defines the structure of your database tables using the Drizzle ORM.

// To modify the database schema:
// 1. Update this file with your desired changes.
// 2. Generate a new migration by running: `npm run db:generate`

// The generated migration file will reflect your schema changes.
// In development the `db-server:file` script runs `db:migrate`, which applies pending migrations before Next.js starts.
// Alternatively, if your database is running, you can run `npm run db:migrate` and there is no need to restart the server.

export const contactMessageSchema = pgTable('contact_message', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Dashboard feedback from signed-in users. userId is the Clerk user id and email is
// captured from the Clerk session at submit time, so the form never asks for it.
export const feedbackSchema = pgTable('feedback', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  email: text('email').notNull(),
  subject: text('subject').default('general').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Public CinePersona profile. Identity (avatar, name, handle, email) is owned by
// Clerk; handle/displayName/avatarUrl are mirrored here so public pages never call
// Clerk. Everything else (country, bio, website, cineType, level) is owned by us.
// The single website is rendered platform-aware (icon + short handle) at display.
// Keyed by the Clerk user id.
export const profileSchema = pgTable('profile', {
  id: text('id').primaryKey(),
  handle: text('handle').notNull().unique(),
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  country: text('country'),
  bio: text('bio'),
  website: text('website'),
  cineType: text('cine_type').$type<CineTypeSlug>(),
  level: integer('level').default(1).notNull(),
  xp: integer('xp').default(0).notNull(),
  isPublic: boolean('is_public').default(true).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Catalogue cache of the ~50k most popular films, keyed by TMDB id. The films grid and
// the profile film grids read from here; the detail page enriches with a live TMDB call
// for cast/crew. Only poster/backdrop paths are stored — the full image URL is built at
// render (see docs/cinepersona-docs/TMDB.md).
export const movieSchema = pgTable(
  'movie',
  {
    tmdbId: integer('tmdb_id').primaryKey(),
    title: text('title').notNull(),
    originalTitle: text('original_title'),
    overview: text('overview'),
    posterPath: text('poster_path'),
    backdropPath: text('backdrop_path'),
    releaseDate: text('release_date'),
    popularity: doublePrecision('popularity').default(0).notNull(),
    voteAverage: doublePrecision('vote_average').default(0).notNull(),
    voteCount: integer('vote_count').default(0).notNull(),
    genreIds: jsonb('genre_ids').$type<number[]>().default([]).notNull(),
    originalLanguage: text('original_language'),
    adult: boolean('adult').default(false).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index('movie_popularity_idx').on(t.popularity),
    index('movie_release_date_idx').on(t.releaseDate),
    index('movie_title_idx').on(t.title),
  ],
);

// One row per (user, movie). A film can be both watched and on the watchlist; the two
// flags are independent. userId is the Clerk user id (matches profile.id).
export const userMovieSchema = pgTable(
  'user_movie',
  {
    userId: text('user_id').notNull(),
    movieId: integer('movie_id')
      .notNull()
      .references(() => movieSchema.tmdbId, { onDelete: 'cascade' }),
    watched: boolean('watched').default(false).notNull(),
    watchlist: boolean('watchlist').default(false).notNull(),
    watchedAt: timestamp('watched_at', { mode: 'date' }),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.movieId] }),
    index('user_movie_watched_idx').on(t.userId, t.watched),
    index('user_movie_watchlist_idx').on(t.userId, t.watchlist),
  ],
);

// One row per follow edge: followerId follows followingId. Both are Clerk user ids
// (= profile.id). Powers the connections lists and follower/following counts.
export const followSchema = pgTable(
  'follow',
  {
    followerId: text('follower_id').notNull(),
    followingId: text('following_id').notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.followerId, t.followingId] }),
    index('follow_following_idx').on(t.followingId),
    index('follow_follower_idx').on(t.followerId),
  ],
);

// One row per block edge: blockerId blocked blockedId. Blocking removes any follow
// edges in both directions (handled in Social.ts) and prevents new follows either way.
export const blockSchema = pgTable(
  'block',
  {
    blockerId: text('blocker_id').notNull(),
    blockedId: text('blocked_id').notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.blockerId, t.blockedId] }),
    index('block_blocked_idx').on(t.blockedId),
  ],
);

// One completed CineTest. Anonymous results are allowed (userId nullable; set to the
// Clerk user id when signed in, matching profile.id). The normalized trait vector,
// the full answer snapshot, and the favorite picks are kept for the explainable
// result page and any future recommendation work. Questions themselves are static
// (src/data/cinetest-questions.ts), so only results live in the database.
export const cinetestResultSchema = pgTable(
  'cinetest_result',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id'),
    cineType: text('cine_type').$type<CineTypeSlug>().notNull(),
    axisScores: jsonb('axis_scores').$type<CineVector>().notNull(),
    answers: jsonb('answers').$type<CineAnswerMap>().notNull(),
    filmPicks: jsonb('film_picks').$type<CineFilmPicks>().notNull(),
    descriptor: text('descriptor').$type<CineDescriptorKey>().notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [index('cinetest_result_user_idx').on(t.userId)],
);

// --- Community ---------------------------------------------------------------
// A lightweight, Reddit-style discussion space layered on profiles. Members open
// posts under a fixed film genre (category slug, static in
// src/data/community-categories.ts) and others vote, comment, and report. All
// author/voter/reporter ids are Clerk user ids (= profile.id). Sharing is a
// client-side copy-link and needs no table.

// One post (thread) under a category. `score` (= upvotes − downvotes) and
// `commentCount` are denormalized caches kept in sync by Community.ts so list pages
// sort by hot/top/new without aggregating. `isRemoved` is a soft delete by the author.
export const communityPostSchema = pgTable(
  'community_post',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    authorId: text('author_id').notNull(),
    category: text('category').$type<CommunityCategorySlug>().notNull(),
    title: text('title').notNull(),
    body: text('body').notNull(),
    score: integer('score').default(0).notNull(),
    commentCount: integer('comment_count').default(0).notNull(),
    isRemoved: boolean('is_removed').default(false).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index('community_post_category_score_idx').on(t.category, t.score),
    index('community_post_category_created_idx').on(t.category, t.createdAt),
    index('community_post_author_idx').on(t.authorId),
  ],
);

// One comment on a post. `parentId` (nullable, self-referential) carries threaded
// replies; top-level comments have a null parent. Deleting a post cascades to its
// comments; deleting a parent comment cascades to its replies.
export const communityCommentSchema = pgTable(
  'community_comment',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id')
      .notNull()
      .references(() => communityPostSchema.id, { onDelete: 'cascade' }),
    parentId: uuid('parent_id').references((): AnyPgColumn => communityCommentSchema.id, {
      onDelete: 'cascade',
    }),
    authorId: text('author_id').notNull(),
    body: text('body').notNull(),
    score: integer('score').default(0).notNull(),
    isRemoved: boolean('is_removed').default(false).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index('community_comment_post_idx').on(t.postId, t.createdAt),
    index('community_comment_parent_idx').on(t.parentId),
    index('community_comment_author_idx').on(t.authorId),
  ],
);

// One vote per (user, target). `value` is +1 or −1; clearing a vote deletes the row.
// `targetType` distinguishes post from comment so one table covers both.
export const communityVoteSchema = pgTable(
  'community_vote',
  {
    userId: text('user_id').notNull(),
    targetType: text('target_type').$type<CommunityTarget>().notNull(),
    targetId: uuid('target_id').notNull(),
    value: integer('value').$type<1 | -1>().notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.targetType, t.targetId] }),
    index('community_vote_target_idx').on(t.targetType, t.targetId),
  ],
);

// One report per (reporter, target) — unique so a user can't pile on. `status` lets
// a future moderation queue mark items resolved.
export const communityReportSchema = pgTable(
  'community_report',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    reporterId: text('reporter_id').notNull(),
    targetType: text('target_type').$type<CommunityTarget>().notNull(),
    targetId: uuid('target_id').notNull(),
    reason: text('reason').$type<CommunityReportReason>().notNull(),
    detail: text('detail'),
    status: text('status').$type<'open' | 'resolved'>().default('open').notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex('community_report_unique_idx').on(t.reporterId, t.targetType, t.targetId),
    index('community_report_target_idx').on(t.targetType, t.targetId),
  ],
);

// --- Messaging (DM) ----------------------------------------------------------
// User-to-user direct messages layered on profiles. All participant/sender ids are
// Clerk user ids (= profile.id). Designed for a clean Supabase move later: every row
// carries its owning user id(s) so RLS can map them to auth.uid(), and `message` is
// append-only (soft delete) so Realtime postgres_changes on INSERT stays simple.

// One thread. For 1:1, `pairKey` is the two user ids sorted and joined ("a:b") with a
// unique index, so a duplicate direct thread can never be created. `lastMessageAt` is a
// denormalized sort key kept in sync by Chat.ts (list ordering needs no aggregation).
// `isGroup`/`title` are reserved for future group chats and stay false/null for now.
export const conversationSchema = pgTable(
  'conversation',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    isGroup: boolean('is_group').default(false).notNull(),
    title: text('title'),
    pairKey: text('pair_key'),
    lastMessageAt: timestamp('last_message_at', { mode: 'date' }).defaultNow().notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    uniqueIndex('conversation_pair_key_idx').on(t.pairKey),
    index('conversation_last_message_idx').on(t.lastMessageAt),
  ],
);

// One row per (conversation, user). `lastReadAt` powers unread counts (messages newer
// than it, not sent by me). `isArchived`/`mutedUntil` are per-user inbox state.
export const conversationParticipantSchema = pgTable(
  'conversation_participant',
  {
    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => conversationSchema.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull(),
    lastReadAt: timestamp('last_read_at', { mode: 'date' }),
    isArchived: boolean('is_archived').default(false).notNull(),
    mutedUntil: timestamp('muted_until', { mode: 'date' }),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.conversationId, t.userId] }),
    index('conversation_participant_user_idx').on(t.userId),
  ],
);

// One message. Append-only friendly: edits set `editedAt`, deletes set `deletedAt`
// (soft delete) so threads stay stable for Realtime. `type` reserves space for future
// system/attachment messages; `attachments` for future media.
export const messageSchema = pgTable(
  'message',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => conversationSchema.id, { onDelete: 'cascade' }),
    senderId: text('sender_id').notNull(),
    body: text('body').notNull(),
    type: text('type').$type<'text'>().default('text').notNull(),
    attachments: jsonb('attachments').$type<unknown[]>().default([]).notNull(),
    editedAt: timestamp('edited_at', { mode: 'date' }),
    deletedAt: timestamp('deleted_at', { mode: 'date' }),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [index('message_conversation_created_idx').on(t.conversationId, t.createdAt)],
);

// --- CineMatch (taste-based pairing) -----------------------------------------
// A consent-gated matcher layered on the CineTest vector and watched films. Joining the
// pool makes a viewer matchable; spending a request scans the pool for someone who clears
// the similarity threshold (70% trait axes, 30% shared watched films). All user ids are
// Clerk user ids (= profile.id). The matcher reads vectors and watched films live, so only
// pool membership, requests, and the resulting matches live here.

// One row per pool member, kept across leaves so join history survives. `isActive=false`
// means "left the pool" — unmatchable immediately, no row deleted. `refreshedAt` bumps each
// time the member re-joins; the eligibility gate (CineType done + enough watched) is checked
// in CineMatch.ts, not enforced here.
export const matchPoolSchema = pgTable(
  'match_pool',
  {
    userId: text('user_id').primaryKey(),
    isActive: boolean('is_active').default(true).notNull(),
    joinedAt: timestamp('joined_at', { mode: 'date' }).defaultNow().notNull(),
    refreshedAt: timestamp('refreshed_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [index('match_pool_active_idx').on(t.isActive)],
);

// One row per spent request. The rolling weekly budget counts rows in the last 7 days;
// `expiresAt` (= createdAt + 7d) is the same search horizon — past it the sweep promotes the
// closest candidate as a fallback. `matchId` links the match that fulfilled the request.
export const matchRequestSchema = pgTable(
  'match_request',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    requesterId: text('requester_id').notNull(),
    status: text('status').$type<MatchRequestStatus>().default('searching').notNull(),
    matchId: uuid('match_id'),
    expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index('match_request_requester_idx').on(t.requesterId, t.createdAt),
    index('match_request_status_idx').on(t.status, t.expiresAt),
  ],
);

// One row per pair, ever — `pairKey` (the two ids sorted and joined) is unique, so a pair is
// introduced at most once. `score`/`axisDeltas`/`sharedWatched` snapshot the read at match
// time so the displayed number never drifts when someone retakes the test. Consent is per
// side; the match connects only when both reach `accepted`, opening `conversationId`. A
// decline closes it silently. `isFallback` flags a below-threshold match offered after 7d.
export const matchSchema = pgTable(
  'match',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    pairKey: text('pair_key').notNull(),
    userAId: text('user_a_id').notNull(),
    userBId: text('user_b_id').notNull(),
    score: integer('score').notNull(),
    axisDeltas: jsonb('axis_deltas').$type<MatchAxisCell[]>().notNull(),
    sharedWatched: integer('shared_watched').default(0).notNull(),
    isFallback: boolean('is_fallback').default(false).notNull(),
    requestId: uuid('request_id'),
    consentA: text('consent_a').$type<ConsentState>().default('pending').notNull(),
    consentB: text('consent_b').$type<ConsentState>().default('pending').notNull(),
    status: text('status').$type<MatchStatus>().default('pending').notNull(),
    conversationId: uuid('conversation_id'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    uniqueIndex('match_pair_key_idx').on(t.pairKey),
    index('match_user_a_idx').on(t.userAId, t.status),
    index('match_user_b_idx').on(t.userBId, t.status),
  ],
);

// --- Notifications -----------------------------------------------------------
// One row per notifiable event for a recipient, reusing the connections/community seam.
// `userId` is the recipient and `actorId` is whoever triggered it — both Clerk user ids
// (= profile.id). `postId`/`commentId` point at the community target so the list query can
// resolve the post's category and build a thread link; `matchId` points at a CineMatch so a
// match notification links to it (all null for a follow). `readAt` powers
// the unread badge. Self-notifications are never written (handled in Notification.ts).
export const notificationSchema = pgTable(
  'notification',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    actorId: text('actor_id').notNull(),
    type: text('type').$type<NotificationType>().notNull(),
    postId: uuid('post_id').references(() => communityPostSchema.id, { onDelete: 'cascade' }),
    commentId: uuid('comment_id').references(() => communityCommentSchema.id, {
      onDelete: 'cascade',
    }),
    matchId: uuid('match_id').references(() => matchSchema.id, { onDelete: 'cascade' }),
    readAt: timestamp('read_at', { mode: 'date' }),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [
    index('notification_user_created_idx').on(t.userId, t.createdAt),
    index('notification_user_unread_idx').on(t.userId, t.readAt),
  ],
);
