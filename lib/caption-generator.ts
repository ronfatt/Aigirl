import { composeCaptionPrompt } from "@/lib/prompts";
import { getCaptionModel, getOpenAIClient } from "@/lib/openai";
import { CaptionGenerationResult, Character, SceneTemplate } from "@/lib/types";

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

function normalizeCaptionOptions(options: string[]) {
  return Array.from(
    new Set(
      options
        .map((option) => option.replace(/^[-*\d.)\s]+/, "").trim())
        .filter(Boolean),
    ),
  ).slice(0, 3);
}

function getMockCaptionOptions(tone: Character["postingTone"]) {
  return mockCaptions[tone].slice(0, 3);
}

export async function generateCaptionOptions(input: {
  character: Character;
  scene: SceneTemplate;
  tone?: Character["postingTone"];
}): Promise<CaptionGenerationResult> {
  const tone = input.tone ?? input.character.postingTone;
  const prompt = composeCaptionPrompt({
    character: input.character,
    scene: input.scene,
    tone,
  });
  const fallbackOptions = getMockCaptionOptions(tone);

  if (!process.env.OPENAI_API_KEY) {
    return {
      options: fallbackOptions,
      provider: "mock",
      prompt,
    };
  }

  try {
    const client = getOpenAIClient();
    const response = await client.responses.create({
      model: getCaptionModel(),
      input: [
        {
          role: "system",
          content:
            "You write short lifestyle captions for social media. Return JSON only.",
        },
        {
          role: "user",
          content: `${prompt}

Return valid JSON with this exact shape:
{"options":["caption one","caption two","caption three"]}`,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "caption_options",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              options: {
                type: "array",
                minItems: 3,
                maxItems: 3,
                items: {
                  type: "string",
                },
              },
            },
            required: ["options"],
          },
        },
      },
    });

    const parsed = JSON.parse(response.output_text) as { options?: string[] };
    const options = normalizeCaptionOptions(parsed.options ?? []);

    if (options.length === 3) {
      return {
        options,
        provider: "openai",
        prompt,
      };
    }
  } catch (error) {
    console.error("OpenAI caption generation failed, falling back to mock captions.", error);
  }

  return {
    options: fallbackOptions,
    provider: "mock",
    prompt,
  };
}
