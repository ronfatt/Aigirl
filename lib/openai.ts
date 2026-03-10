import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY.");
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  return openaiClient;
}

export function getCaptionModel() {
  return process.env.OPENAI_CAPTION_MODEL?.trim() || "gpt-4o-mini";
}
