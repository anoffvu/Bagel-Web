CREATE TABLE "guild_users" (
	"id" text PRIMARY KEY NOT NULL,
	"guild_id" text NOT NULL,
	"user_id" text NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "guilds" ADD COLUMN "owner_user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "guilds" ADD COLUMN "subscription_expiry_date" timestamp;--> statement-breakpoint
ALTER TABLE "guild_users" ADD CONSTRAINT "guild_users_guild_id_guilds_id_fk" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON DELETE no action ON UPDATE no action;