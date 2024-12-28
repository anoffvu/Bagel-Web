import OpenAI from "openai";
import { AIProvider } from "../types";
import { AI_MODELS } from "../constants";

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }

  async generateResponse(prompt: string): Promise<string> {
    throw new Error("Method not implemented. Could not process: " + prompt);
  }

  async generateStreamingResponse(prompt: string): Promise<ReadableStream> {
    throw new Error("Method not implemented. Could not process: " + prompt);
  }

  async generateEmbedding(value: string): Promise<number[]> {
    try {
      const response = await this.client.embeddings.create({
        model: AI_MODELS.OPENAI.EMBEDDING,
        input: value,
      });
      return response.data[0].embedding;
    } catch (err) {
      console.error('Failed to generate OpenAI embedding:', err);
      throw new Error(`OpenAI embedding generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }
}
