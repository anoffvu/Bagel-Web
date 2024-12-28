import { AIProviderFactory } from "./provider-factory";

const AI_PROVIDER = "gemini";
const aiProvider = AIProviderFactory.getProvider(AI_PROVIDER);

export const getEmbeddings = async (text: string) => {
  try {
    const res = await aiProvider.generateEmbedding(text);
    return res;
  } catch (err) {
    console.error("Error generating embeddings:", err);
    throw err;
  }
};
