import { composeCaptionPrompt } from "@/lib/prompts";
import { Character, SceneTemplate } from "@/lib/types";
import { pick } from "@/lib/utils";

const mockCaptions: Record<Character["postingTone"], string[]> = {
  "soft lifestyle": [
    "Slow mornings make everything feel lighter.",
    "Keeping the day simple and the light soft.",
    "A little calm before the city gets loud.",
  ],
  "casual intimate": [
    "Just me, good light, and a quiet moment.",
    "This felt like the nicest part of the day.",
    "Tiny rituals, better moods.",
  ],
  playful: [
    "Proof that the plan was simply to enjoy today.",
    "A small main-character moment on purpose.",
    "A good angle and better timing.",
  ],
  "elegant minimal": [
    "Less noise, better energy.",
    "Clean lines, soft light, easy mood.",
    "Quiet luxury starts with a slower pace.",
  ],
};

export async function generateCaption(input: {
  character: Character;
  scene: SceneTemplate;
  tone?: Character["postingTone"];
}) {
  const tone = input.tone ?? input.character.postingTone;
  const fallback = pick(mockCaptions[tone]);

  if (!process.env.OPENAI_API_KEY) {
    return {
      caption: fallback,
      provider: "mock",
      prompt: composeCaptionPrompt({
        character: input.character,
        scene: input.scene,
        tone,
      }),
    };
  }

  // Hook point for the OpenAI Responses API.
  return {
    caption: fallback,
    provider: "openai-placeholder",
    prompt: composeCaptionPrompt({
      character: input.character,
      scene: input.scene,
      tone,
    }),
  };
}
