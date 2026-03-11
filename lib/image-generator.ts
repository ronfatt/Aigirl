import { storeGeneratedImage } from "@/lib/storage";
import { generateReplicateImages } from "@/lib/replicate";
import { makeId } from "@/lib/utils";

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
    const generated = await generateReplicateImages({
      finalPrompt: input.finalPrompt,
      referenceImageUrl: input.referenceImageUrl,
      count,
    });

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
}) {
  return generateImages({
    finalPrompt: input.prompt,
    count: input.imageCount,
    referenceImageUrl: input.referenceImageUrl,
  });
}
