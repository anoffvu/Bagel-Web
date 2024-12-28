CREATE TABLE "guilds" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"has_active_subscription" boolean DEFAULT false NOT NULL,
	"last_active_at" timestamp DEFAULT now() NOT NULL
);
