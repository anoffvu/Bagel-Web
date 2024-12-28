import { db } from "../../db/index";
import { guilds } from "../../db/schema";
import { eq } from "drizzle-orm";

const TRIAL_MESSAGE_LIMIT = 20;

/**
 * Checks if a guild can process more messages based on their subscription status.
 * Returns true if the guild has an active subscription or hasn't exceeded trial limits.
 * 
 * @param guildId - The Discord guild ID to check
 * @returns Promise<boolean> - Whether the guild can process more messages
 */
export async function canProcessMessage(guildId: string): Promise<boolean> {
  const guild = await db
    .select()
    .from(guilds)
    .where(eq(guilds.id, guildId))
    .limit(1);

  if (!guild.length) return false;

  if (guild[0].hasActiveSubscription) return true;

  const messagesProcessed = parseInt(guild[0].messagesProcessed);
  return messagesProcessed < TRIAL_MESSAGE_LIMIT;
}

/**
 * Increments the message count for a guild.
 * Should be called after successfully processing a message or command.
 * 
 * @param guildId - The Discord guild ID
 */
export async function incrementMessageCount(guildId: string): Promise<void> {
  const guild = await db
    .select()
    .from(guilds)
    .where(eq(guilds.id, guildId))
    .limit(1);

  if (!guild.length) return;

  const currentCount = parseInt(guild[0].messagesProcessed);
  await db
    .update(guilds)
    .set({ 
      messagesProcessed: (currentCount + 1).toString(),
      lastActiveAt: new Date()
    })
    .where(eq(guilds.id, guildId));
}

/**
 * Gets a subscription status message for the guild.
 * Returns null if the guild has an active subscription or hasn't exceeded trial limits.
 * 
 * @param guildId - The Discord guild ID
 * @returns Promise<string|null> - The status message or null if no message needed
 */
export async function getSubscriptionMessage(guildId: string): Promise<string|null> {
  const guild = await db
    .select()
    .from(guilds)
    .where(eq(guilds.id, guildId))
    .limit(1);

  if (!guild.length) return null;
  if (guild[0].hasActiveSubscription) return null;

  const messagesProcessed = parseInt(guild[0].messagesProcessed);
  if (messagesProcessed >= TRIAL_MESSAGE_LIMIT) {
    return "⚠️ Trial limit reached! Please purchase a subscription to continue using the bot. " +
           "Contact the bot owner for subscription details.";
  }

  return null;
} 