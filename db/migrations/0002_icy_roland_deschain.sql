CREATE TABLE IF NOT EXISTS "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"username" text NOT NULL,
	"content" text NOT NULL,
	"channel_id" text NOT NULL,
	"guild_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"created_at_local" timestamp DEFAULT now() NOT NULL,
	"embedding" vector(768),
	"isIntroduction" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "summaries" (
	"id" text PRIMARY KEY NOT NULL,
	"guild_id" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"summary" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "messages"
ADD COLUMN "isIntroduction" boolean DEFAULT false;
