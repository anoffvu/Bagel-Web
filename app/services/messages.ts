import { Message, TextChannel, Collection } from "discord.js";
import { db } from "../../db/index";
import { messages, guilds } from "../../db/schema";
import { sql, eq } from "drizzle-orm";
import { getEmbeddings } from "./ai/embeddings";
import { classifyMessageAsIntro } from "./classifyMessage";
import { Summary } from "../types/index";
import { CONFIG } from "../config/constants";
import { canProcessMessage, incrementMessageCount } from "./subscription";

/**
 * Retrieves recent messages from the database for a specific guild.
 * 
 * @param guildId - The Discord guild ID to fetch messages for
 * @param existingSummary - Optional existing summary with end date
 * @returns Promise<any[]> - Array of retrieved messages
 */
export async function getRecentMessages(
  guildId: string | null,
  existingSummary?: Summary
): Promise<any[]> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return await db
    .select()
    .from(messages)
    .where(
      existingSummary
        ? sql`created_at > ${existingSummary.endDate} AND created_at <= ${new Date()}`
        : sql`created_at >= ${sevenDaysAgo}`
    )
    .orderBy(messages.createdAt);
}

/**
 * Stores a Discord message in the database and processes it if it's an introduction.
 * Generates embeddings and classifies the message before storage.
 * 
 * @param message - The Discord message to store
 */
export async function storeMessage(message: Message): Promise<void> {
  try {
    const existingMessage = await db
      .select()
      .from(messages)
      .where(eq(messages.id, message.id))
      .limit(1);

    if (existingMessage.length > 0) return;

    console.log("Processing message:", message);

    // Check if we can process this message based on subscription/trial status
    if (message.guildId && !(await canProcessMessage(message.guildId))) {
      console.log(`Skipping message processing for guild ${message.guildId} - trial limit reached`);
      return;
    }

    const isIntroduction = await classifyMessageAsIntro(message.content);
    const embedding = await getEmbeddings(message.content);
    
    const messageData = {
      id: message.id,
      userId: message.author.id,
      username: message.author.username,
      content: message.content,
      channelId: message.channel.id,
      guildId: message.guildId ?? "",
      createdAt: message.createdAt,
      embedding,
      isIntroduction,
    };

    // Update guild's last active timestamp
    if (message.guildId) {
      await db
        .update(guilds)
        .set({ lastActiveAt: new Date() })
        .where(eq(guilds.id, message.guildId));
    }

    await db.insert(messages).values(messageData);

    // Increment the message count for trial guilds
    if (message.guildId) {
      console.log("Incrementing message count for guild:", message.guildId);
      await incrementMessageCount(message.guildId);
    }

    // If this is an introduction, process it through the profile endpoint
    if (isIntroduction) {
      try {
        const response = await fetch(`${process.env.API_BASE_URL}/api/profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: message.author.username,
            bio: message.content,
          }),
        });

        if (!response.ok) {
          throw new Error(`Profile API error: ${response.statusText}`);
        }

        const result = await response.json();
        console.log(`Profile processed for user ${message.author.username}:`, result);
      } catch (error) {
        console.error('Error processing profile:', error);
        // Don't throw here - we want to continue even if profile processing fails
      }
    }
  } catch (error) {
    throw new Error(`Failed to store message: ${error}`);
  }
}

/**
 * Processes historical messages from a Discord channel.
 * Fetches messages in batches and stores them in the database.
 * 
 * @param channel - The Discord text channel to process
 * @returns Promise<number> - Number of messages processed
 */
export async function processHistoricalMessages(channel: TextChannel): Promise<number> {
  try {
    let lastMessageId: string | undefined;
    const batchSize = CONFIG.BATCH_SIZE;
    let processedCount = 0;

    while (true) {
      const options: any = { limit: batchSize };
      if (lastMessageId) {
        options.before = lastMessageId;
      }

      const messages = (await channel.messages.fetch(
        options
      )) as unknown as Collection<string, Message>;

      if (!messages || messages.size === 0) {
        break; // No more messages to process
      }

      for (const [_, message] of messages) {
        if (!message.author.bot) {
          try {
            await storeMessage(message);
            processedCount++;

            // Add a small delay to avoid overwhelming the API
            await new Promise((resolve) => setTimeout(resolve, CONFIG.MESSAGE_DELAY));
          } catch (error) {
            console.error(`Error processing message ${message.id}:`, error);
          }
        }
      }

      lastMessageId = messages.last()?.id;
      console.log(`Processed ${processedCount} messages so far...`);

      // Add delay between batches to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, CONFIG.BATCH_DELAY));
    }

    console.log(`Finished processing ${processedCount} messages`);
    return processedCount;
  } catch (error) {
    console.error("Error processing historical messages:", error);
    throw error;
  }
} 