import { storeGeneratedImage } from "@/lib/storage";
import { generateReplicateImages } from "@/lib/replicate";
import { makeId } from "@/lib/utils";

function isNsfwGenerationError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return /nsfw|safety/i.test(error.message);
}

function softenPromptForSafety(prompt: string) {
  return prompt
    .replace(/\bsensual\b/gi, "soft lifestyle")
    .replace(/\balluring\b/gi, "natural")
    .replace(/\bseductive\b/gi, "relaxed")
    .replace(/\bteasing\b/gi, "playful")
    .replace(/\bsexy\b/gi, "stylish")
    .replace(/\bfeminine curves\b/gi, "natural feminine silhouette")
    .replace(/\bsubtle body curve\b/gi, "relaxed natural posture")
    .replace(/\bconfident feminine energy\b/gi, "calm feminine energy")
    .replace(/\bplayful confident expression\b/gi, "natural relaxed expression")
    .replace(/\bwearing bikini\b/gi, "wearing tasteful resortwear")
    .replace(/\bbikini\b/gi, "resortwear")
    .replace(/\bswimwear\b/gi, "resortwear")
    .replace(/\blow-cut\b/gi, "soft neckline")
    .replace(/\bdeep v-neck\b/gi, "soft neckline")
    .replace(/\bcleavage\b/gi, "upper-body styling")
    .replace(/\bwet hair\b/gi, "sunlit hair")
    .concat(
      "\n\nSafety rewrite: keep the same persona identity, same selected scene, same overall aesthetic direction, but use more tasteful resort styling, less revealing wardrobe emphasis, and a calmer natural pose.",
    );
}

async function generateMockImages(input: {
  finalPrompt: string;
  count: number;
}) {
  return Promise.all(
    Array.from({ length: input.count }).map(async (_, index) => {
      const seed = encodeURIComponent(`${input.finalPrompt}-${index}`);
      const placeholder = `https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80&sig=${seed}`;
      const stored = await storeGeneratedImage({
        url: placeholder,
        filename: `${makeId("persona")}.jpg`,
      });
      return stored.url;
    }),
  );
}

export async function generateImages(input: {
  finalPrompt: string;
  count: number;
  referenceImageUrl?: string;
  promptStrength?: number;
}) {
  const count = Math.min(Math.max(input.count, 1), 4);
  const allowMockFallback = !process.env.REPLICATE_API_TOKEN;

  if (allowMockFallback) {
    return generateMockImages({
      finalPrompt: input.finalPrompt,
      count,
    });
  }

  try {
    let generated: string[];

    try {
      generated = await generateReplicateImages({
        finalPrompt: input.finalPrompt,
        referenceImageUrl: input.referenceImageUrl,
        count,
        promptStrength: input.promptStrength,
      });
    } catch (error) {
      if (!isNsfwGenerationError(error)) {
        throw error;
      }

      generated = await generateReplicateImages({
        finalPrompt: softenPromptForSafety(input.finalPrompt),
        referenceImageUrl: input.referenceImageUrl,
        count,
        promptStrength: input.promptStrength,
      });
    }

    return Promise.all(
      generated.map(async (url) => {
        const stored = await storeGeneratedImage({
          url,
          filename: `${makeId("persona")}.jpg`,
        });
        return stored.url;
      }),
    );
  } catch (error) {
    console.error("Replicate generation failed.", error);
    throw new Error(
      error instanceof Error
        ? `Replicate generation failed: ${error.message}`
        : "Replicate generation failed.",
    );
  }
}

export async function generatePersonaImages(input: {
  prompt: string;
  imageCount: number;
  referenceImageUrl?: string;
  promptStrength?: number;
}) {
  return generateImages({
    finalPrompt: input.prompt,
    count: input.imageCount,
    referenceImageUrl: input.referenceImageUrl,
    promptStrength: input.promptStrength,
  });
}
