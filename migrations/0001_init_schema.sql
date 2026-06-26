DROP TABLE "counter";
--> statement-breakpoint
CREATE TABLE "block" (
	"blocker_id" text NOT NULL,
	"blocked_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "block_blocker_id_blocked_id_pk" PRIMARY KEY("blocker_id","blocked_id")
);
--> statement-breakpoint
CREATE TABLE "cinetest_result" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"cine_type" text NOT NULL,
	"axis_scores" jsonb NOT NULL,
	"answers" jsonb NOT NULL,
	"film_picks" jsonb NOT NULL,
	"descriptor" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_comment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"parent_id" uuid,
	"author_id" text NOT NULL,
	"body" text NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"is_removed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_post" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" text NOT NULL,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"comment_count" integer DEFAULT 0 NOT NULL,
	"is_removed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_report" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporter_id" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" uuid NOT NULL,
	"reason" text NOT NULL,
	"detail" text,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_vote" (
	"user_id" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" uuid NOT NULL,
	"value" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "community_vote_user_id_target_type_target_id_pk" PRIMARY KEY("user_id","target_type","target_id")
);
--> statement-breakpoint
CREATE TABLE "contact_message" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversation_participant" (
	"conversation_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"last_read_at" timestamp,
	"is_archived" boolean DEFAULT false NOT NULL,
	"muted_until" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "conversation_participant_conversation_id_user_id_pk" PRIMARY KEY("conversation_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "conversation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_group" boolean DEFAULT false NOT NULL,
	"title" text,
	"pair_key" text,
	"last_message_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"email" text NOT NULL,
	"subject" text DEFAULT 'general' NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "follow" (
	"follower_id" text NOT NULL,
	"following_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "follow_follower_id_following_id_pk" PRIMARY KEY("follower_id","following_id")
);
--> statement-breakpoint
CREATE TABLE "message" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender_id" text NOT NULL,
	"body" text NOT NULL,
	"type" text DEFAULT 'text' NOT NULL,
	"attachments" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"edited_at" timestamp,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movie" (
	"tmdb_id" integer PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"original_title" text,
	"overview" text,
	"poster_path" text,
	"backdrop_path" text,
	"release_date" text,
	"popularity" double precision DEFAULT 0 NOT NULL,
	"vote_average" double precision DEFAULT 0 NOT NULL,
	"vote_count" integer DEFAULT 0 NOT NULL,
	"genre_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"original_language" text,
	"adult" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"actor_id" text NOT NULL,
	"type" text NOT NULL,
	"post_id" uuid,
	"comment_id" uuid,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"id" text PRIMARY KEY NOT NULL,
	"handle" text NOT NULL,
	"display_name" text,
	"avatar_url" text,
	"country" text,
	"bio" text,
	"website" text,
	"cine_type" text,
	"level" integer DEFAULT 1 NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profile_handle_unique" UNIQUE("handle")
);
--> statement-breakpoint
CREATE TABLE "user_movie" (
	"user_id" text NOT NULL,
	"movie_id" integer NOT NULL,
	"watched" boolean DEFAULT false NOT NULL,
	"watchlist" boolean DEFAULT false NOT NULL,
	"watched_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_movie_user_id_movie_id_pk" PRIMARY KEY("user_id","movie_id")
);
--> statement-breakpoint
ALTER TABLE "community_comment" ADD CONSTRAINT "community_comment_post_id_community_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."community_post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_comment" ADD CONSTRAINT "community_comment_parent_id_community_comment_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."community_comment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participant" ADD CONSTRAINT "conversation_participant_conversation_id_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_conversation_id_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_post_id_community_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."community_post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_comment_id_community_comment_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."community_comment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_movie" ADD CONSTRAINT "user_movie_movie_id_movie_tmdb_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movie"("tmdb_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "block_blocked_idx" ON "block" USING btree ("blocked_id");--> statement-breakpoint
CREATE INDEX "cinetest_result_user_idx" ON "cinetest_result" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "community_comment_post_idx" ON "community_comment" USING btree ("post_id","created_at");--> statement-breakpoint
CREATE INDEX "community_comment_parent_idx" ON "community_comment" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "community_comment_author_idx" ON "community_comment" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "community_post_category_score_idx" ON "community_post" USING btree ("category","score");--> statement-breakpoint
CREATE INDEX "community_post_category_created_idx" ON "community_post" USING btree ("category","created_at");--> statement-breakpoint
CREATE INDEX "community_post_author_idx" ON "community_post" USING btree ("author_id");--> statement-breakpoint
CREATE UNIQUE INDEX "community_report_unique_idx" ON "community_report" USING btree ("reporter_id","target_type","target_id");--> statement-breakpoint
CREATE INDEX "community_report_target_idx" ON "community_report" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "community_vote_target_idx" ON "community_vote" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "conversation_participant_user_idx" ON "conversation_participant" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "conversation_pair_key_idx" ON "conversation" USING btree ("pair_key");--> statement-breakpoint
CREATE INDEX "conversation_last_message_idx" ON "conversation" USING btree ("last_message_at");--> statement-breakpoint
CREATE INDEX "follow_following_idx" ON "follow" USING btree ("following_id");--> statement-breakpoint
CREATE INDEX "follow_follower_idx" ON "follow" USING btree ("follower_id");--> statement-breakpoint
CREATE INDEX "message_conversation_created_idx" ON "message" USING btree ("conversation_id","created_at");--> statement-breakpoint
CREATE INDEX "movie_popularity_idx" ON "movie" USING btree ("popularity");--> statement-breakpoint
CREATE INDEX "movie_release_date_idx" ON "movie" USING btree ("release_date");--> statement-breakpoint
CREATE INDEX "movie_title_idx" ON "movie" USING btree ("title");--> statement-breakpoint
CREATE INDEX "notification_user_created_idx" ON "notification" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "notification_user_unread_idx" ON "notification" USING btree ("user_id","read_at");--> statement-breakpoint
CREATE INDEX "user_movie_watched_idx" ON "user_movie" USING btree ("user_id","watched");--> statement-breakpoint
CREATE INDEX "user_movie_watchlist_idx" ON "user_movie" USING btree ("user_id","watchlist");