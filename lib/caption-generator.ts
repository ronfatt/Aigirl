import { composeCaptionPrompt } from "@/lib/prompts";
import { getCaptionModel, getOpenAIClient } from "@/lib/openai";
import { CaptionGenerationResult, Character, Platform, SceneTemplate } from "@/lib/types";

const mockInstagramCaptions: Record<Character["postingTone"], string[]> = {
  "soft lifestyle": [
    "You noticed this one, didn't you?",
    "Soft light, slower mood, better timing.",
    "Quiet confidence tends to linger longer.",
  ],
  "casual intimate": [
    "This one felt a little too personal to skip.",
    "A quiet moment that said more than expected.",
    "Not trying too hard usually works best here.",
  ],
  playful: [
    "I knew this angle was going to behave badly.",
    "Nothing dramatic. Just hard to scroll past.",
    "A little playful, a little too aware of the effect.",
  ],
  "elegant minimal": [
    "Less noise, more presence.",
    "Clean lines, soft light, and no rush.",
    "The quieter moments usually say the most.",
  ],
};

const mockFacebookCaptions: Record<Character["postingTone"], string[]> = {
  "soft lifestyle": [
    "Today felt slower in the best way. I kept things simple, stayed close to the light, and let one quiet moment stretch a little longer than usual. Days like this always remind me that calm can be its own kind of luxury.",
    "Some of my favorite days are the ones that do not look impressive from the outside. A little soft light, a familiar corner, and enough space to breathe can change the mood of everything. I think I am learning to appreciate these small pauses more and more.",
    "There was something especially gentle about today. I did not do much, but the mood, the light, and the stillness made it feel memorable anyway. Sometimes that kind of quiet stays with me longer than the busy days do. Do you also enjoy afternoons that ask for less?",
  ],
  "casual intimate": [
    "This felt like one of those small private moments that somehow become the best part of the day. I stayed where the light was nicest, let myself slow down, and did not rush the feeling. It is funny how the softest moments can leave the strongest impression.",
    "I was not planning to make much of today, but it turned into one of those moods I wanted to hold onto a little longer. Good light, a quiet space, and the kind of calm that makes everything feel softer. Some days do not need much to feel personal.",
    "I keep thinking about how much atmosphere can change a whole day. A little stillness, a familiar room, and a softer mood can make even ordinary moments feel close and memorable. It was one of those afternoons I did not want to rush through. What kind of moment resets you lately?",
  ],
  playful: [
    "I told myself this was just a casual moment, but it ended up having a little more attitude than expected. Maybe it was the light, maybe it was the mood, maybe I just liked the way the whole scene came together. Either way, this one felt fun to keep.",
    "There are days when everything feels ordinary, and then there are days when the smallest detail gives the whole mood a little spark. That was today for me. A simple setting, a better expression than I planned, and just enough energy to make it interesting.",
    "This felt playful in a way I did not really plan. I think the best photos usually happen when the mood is relaxed and you stop trying to make everything perfect. Sometimes the little bit of spontaneity is what makes a moment worth sharing. Would you have posted this one too?",
  ],
  "elegant minimal": [
    "I always come back to simple moments when I want things to feel grounded again. Clean lines, soft light, and a quieter mood somehow say more than anything overdone ever could. There is something about understated days that feels easier to remember.",
    "The older I get, the more I like moments that feel refined without trying too hard. Good light, an uncluttered setting, and a calm pace can make even a small part of the day feel complete. This was one of those moments for me.",
    "I like when a day feels polished without losing its softness. Nothing too loud, nothing too forced, just the kind of atmosphere that makes you want to stay in it a little longer. Those are usually the moments I end up sharing most. Do quieter days stay with you more too?",
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

function getMockCaptionOptions(
  tone: Character["postingTone"],
  platform: Exclude<Platform, "both">,
) {
  const source = platform === "facebook" ? mockFacebookCaptions : mockInstagramCaptions;
  return source[tone].slice(0, 3);
}

export async function generateCaptionOptions(input: {
  character: Character;
  scene: SceneTemplate;
  tone?: Character["postingTone"];
  platform?: Exclude<Platform, "both">;
}): Promise<CaptionGenerationResult> {
  const tone = input.tone ?? input.character.postingTone;
  const platform = input.platform ?? "instagram";
  const prompt = composeCaptionPrompt({
    character: input.character,
    scene: input.scene,
    tone,
    platform,
  });
  const fallbackOptions = getMockCaptionOptions(tone, platform);

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
            platform === "facebook"
              ? "You write warm, personal Facebook lifestyle posts that feel like real diary-style sharing. Vary sentence openings, include small concrete details, and avoid generic positivity. Return JSON only."
              : "You write short, memorable Instagram lifestyle captions that feel human, lightly magnetic, and not generic. Avoid cliché influencer wording. Return JSON only.",
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
