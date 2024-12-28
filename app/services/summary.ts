import { AIProvider } from "./ai/types";
import { Summary } from "../types/index";

/**
 * Processes a batch of messages to generate summaries.
 * Breaks down large message sets into smaller batches for efficient processing.
 * 
 * @param messages - Array of messages to process
 * @param provider - AI provider instance for generating summaries
 * @param batchSize - Optional size of each batch (default: 50)
 * @returns Promise<string[]> - Array of batch summaries
 */
export async function processMessageBatch(
  messages: any[],
  provider: AIProvider,
  batchSize: number = 50
): Promise<string[]> {
  const batchSummaries: string[] = [];
  
  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);
    const batchText = batch
      .map(msg => `${msg.username}: ${msg.content}`)
      .join("\n");

    const prompt = `
      Analyze these messages and create a brief, meaningful summary of the key discussions and topics.
      Ignore any irrelevant messages, greetings, or small talk.
      Focus on the most important information and insights shared.
      
      Messages:
      ${batchText}
    `;

    const batchSummary = await provider.generateResponse(prompt);
    if (batchSummary.trim().toLowerCase() !== "no meaningful content found") {
      batchSummaries.push(batchSummary);
    }

    // Add delay between batches
    if (i + batchSize < messages.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return batchSummaries;
}

/**
 * Generates a final summary from batch summaries and optionally merges with existing summary.
 * 
 * @param provider - AI provider instance for generating the summary
 * @param batchSummaries - Array of batch summaries to combine
 * @param existingSummary - Optional existing summary to incorporate
 * @returns Promise<string> - The final generated summary
 */
export async function generateFinalSummary(
  provider: AIProvider,
  batchSummaries: string[],
  existingSummary?: Summary
): Promise<string> {
  const finalPrompt = existingSummary 
    ? `
      Here is an existing summary of earlier discussions:
      ${existingSummary.summary}

      Here are summaries of new discussions since then:
      ${batchSummaries.join("\n\n")}
      
      Create an updated weekly summary incorporating both the old and new discussions.
      Format the summary with bullet points for key topics/discussions.
    `
    : `
      Create a concise weekly summary from these batch summaries:
      ${batchSummaries.join("\n\n")}
      
      Format the summary with bullet points for key topics/discussions.
    `;

  return await provider.generateResponse(finalPrompt);
} 