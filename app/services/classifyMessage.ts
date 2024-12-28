import { AIProviderFactory } from "./ai/provider-factory";
import { AIModelProvider } from "./ai/types";

/**
 * Analyzes a message to determine if it's a personal introduction.
 * Uses AI to classify the message based on its content and characteristics.
 * 
 * @param content - The message content to analyze
 * @returns Promise<boolean> - True if the message is an introduction, false otherwise
 */
export async function classifyMessageAsIntro(content: string): Promise<boolean> {
  try {
    const provider = AIProviderFactory.getProvider(
      process.env.AI_PROVIDER as AIModelProvider
    );
    
    const prompt = `
      Analyze this message and determine if it's a personal introduction/bio or a regular message.
      A personal introduction typically includes:
      - Information about oneself
      - Background, interests, or experiences
      - Often posted in introduction/welcome channels
      - Usually longer and more detailed about the person

      Regular messages are typically:
      - Casual conversation
      - Questions or responses
      - General chat
      - Not focused on introducing oneself

      Message:
      ${content}

      Reply with only "true" if this is an introduction/bio, or "false" if it's a regular message.
    `;

    const response = await provider.generateResponse(prompt);
    return response.trim().toLowerCase() === "true";
  } catch (error) {
    console.error("Error classifying message:", error);
    return false;
  }
} 