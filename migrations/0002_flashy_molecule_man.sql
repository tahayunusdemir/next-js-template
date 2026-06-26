CREATE TABLE "match_pool" (
	"user_id" text PRIMARY KEY NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"refreshed_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "match_request" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requester_id" text NOT NULL,
	"status" text DEFAULT 'searching' NOT NULL,
	"match_id" uuid,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "match" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pair_key" text NOT NULL,
	"user_a_id" text NOT NULL,
	"user_b_id" text NOT NULL,
	"score" integer NOT NULL,
	"axis_deltas" jsonb NOT NULL,
	"shared_watched" integer DEFAULT 0 NOT NULL,
	"is_fallback" boolean DEFAULT false NOT NULL,
	"request_id" uuid,
	"consent_a" text DEFAULT 'pending' NOT NULL,
	"consent_b" text DEFAULT 'pending' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"conversation_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notification" ADD COLUMN "match_id" uuid;--> statement-breakpoint
CREATE INDEX "match_pool_active_idx" ON "match_pool" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "match_request_requester_idx" ON "match_request" USING btree ("requester_id","created_at");--> statement-breakpoint
CREATE INDEX "match_request_status_idx" ON "match_request" USING btree ("status","expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "match_pair_key_idx" ON "match" USING btree ("pair_key");--> statement-breakpoint
CREATE INDEX "match_user_a_idx" ON "match" USING btree ("user_a_id","status");--> statement-breakpoint
CREATE INDEX "match_user_b_idx" ON "match" USING btree ("user_b_id","status");--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_match_id_match_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."match"("id") ON DELETE cascade ON UPDATE no action;