import { Guild } from "discord.js";
import { db } from "../../db/index";
import { guilds, guildUsers } from "../../db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid';

/**
 * Ensures a guild is tracked in the database.
 * Creates or updates the guild record.
 * 
 * @param guild - The Discord guild to track
 * @param ownerUserId - The Discord user ID who added the bot
 */
export async function trackGuild(guild: Guild, ownerUserId: string): Promise<void> {
  const existingGuild = await db
    .select()
    .from(guilds)
    .where(eq(guilds.id, guild.id))
    .limit(1);

  if (existingGuild.length === 0) {
    // New guild, insert it
    await db.insert(guilds).values({
      id: guild.id,
      name: guild.name,
      ownerUserId: ownerUserId,
    });
  } else {
    // Update existing guild's last active time and name if changed
    await db
      .update(guilds)
      .set({ 
        lastActiveAt: new Date(),
        name: guild.name 
      })
      .where(eq(guilds.id, guild.id));
  }
}

/**
 * Updates a guild's subscription status in the database.
 * 
 * @param guildId - The Discord guild ID
 * @param hasSubscription - Whether the guild has an active subscription
 * @param expiryDate - The date when the subscription expires
 */
export async function updateGuildSubscription(
  guildId: string,
  hasSubscription: boolean,
  expiryDate: Date
): Promise<void> {
  console.log(`Updating guild ${guildId} subscription status to ${hasSubscription} with expiry date ${expiryDate}`);
  await db
    .update(guilds)
    .set({ 
      hasActiveSubscription: hasSubscription,
      subscriptionExpiryDate: expiryDate 
    })
    .where(eq(guilds.id, guildId));
}

/**
 * Associates a user with a guild in the database.
 * This should be called when a user adds the bot to a guild.
 * 
 * @param guildId - The Discord guild ID
 * @param discordUserId - The Discord user ID who added the bot
 * @param supabaseUserId - The Supabase user ID who added the bot
 */
export async function associateUserWithGuild(
  guildId: string,
  discordUserId: string,
  supabaseUserId: string
): Promise<void> {
  await db.insert(guildUsers).values({
    id: uuidv4(),
    guildId,
    discordUserId,
    supabaseUserId,
  });
}

/**
 * Updates a guild's description in the database.
 * 
 * @param guildId - The Discord guild ID
 * @param description - The new description for the guild
 */
export async function updateGuildDescription(
  guildId: string,
  description: string | null
): Promise<void> {
  await db
    .update(guilds)
    .set({ description })
    .where(eq(guilds.id, guildId));
} 