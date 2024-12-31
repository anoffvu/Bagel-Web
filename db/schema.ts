import { pgTable, text, timestamp, vector, boolean } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";

export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  username: text("username").notNull(),
  content: text("content").notNull(),
  channelId: text("channel_id").notNull(),
  guildId: text("guild_id").notNull(),
  createdAt: timestamp("created_at").notNull(),
  createdAtLocal: timestamp("created_at_local").defaultNow().notNull(),
  embedding: vector("embedding", { dimensions: 768 }),
  isIntroduction: boolean().default(false),
});

export const insertMessageSchema = createSelectSchema(messages).extend({}).omit({
  id: true,
});

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

export const summaries = pgTable("summaries", {
  id: text("id").primaryKey(),
  guildId: text("guild_id").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  summary: text("summary").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Summary = typeof summaries.$inferSelect;
export type NewSummary = typeof summaries.$inferInsert;

export const guilds = pgTable("guilds", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  ownerUserId: text("owner_user_id").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  hasActiveSubscription: boolean("has_active_subscription").default(false).notNull(),
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
  messagesProcessed: text("messages_processed").default("0").notNull(),
  subscriptionExpiryDate: timestamp("subscription_expiry_date"),
  description: text("description"),
});

export type Guild = typeof guilds.$inferSelect;
export type NewGuild = typeof guilds.$inferInsert;

export const guildUsers = pgTable("guild_users", {
  id: text("id").primaryKey(),
  guildId: text("guild_id").notNull().references(() => guilds.id),
  discordUserId: text("discord_user_id").notNull(),
  supabaseUserId: text("supabase_user_id").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export type GuildUser = typeof guildUsers.$inferSelect;
export type NewGuildUser = typeof guildUsers.$inferInsert;
