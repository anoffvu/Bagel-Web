import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider } from "../types";
import { AI_MODELS } from "../constants";

export class GeminiProvider implements AIProvider {
  private client: GoogleGenerativeAI;

  constructor() {
    this.client = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
  }

  async generateResponse(prompt: string, context?: string): Promise<string> {
    const model = this.client.getGenerativeModel({
      model: AI_MODELS.GEMINI.FLASH,
    });

    // Create a prompt that includes both context and question
    const fullPrompt = context 
      ? `Context:\n${context}\n\nQuestion: ${prompt}\n\nAnswer based on the context above:`
      : prompt;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  }

  async generateStreamingResponse(prompt: string): Promise<ReadableStream> {
    const model = this.client.getGenerativeModel({
      model: AI_MODELS.GEMINI.FLASH,
    });
    const result = await model.generateContentStream(prompt);

    // Convert Gemini's stream to a standard ReadableStream
    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            controller.enqueue(chunk.text());
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });
  }

  async generateEmbedding(value: string): Promise<number[]> {
    const model = this.client.getGenerativeModel({
      model: AI_MODELS.GEMINI.EMBEDDING,
    });

    try {
      const result = await model.embedContent(value);
      return result.embedding.values;
    } catch (err) {
      console.error('Failed to generate embedding:', err);
      throw new Error(`Embedding generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }
}
