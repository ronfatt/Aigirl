import { storeGeneratedImage } from "@/lib/blob";
import { makeId } from "@/lib/utils";

export async function generatePersonaImages(input: {
  prompt: string;
  imageCount: number;
  referenceImageUrl?: string;
}) {
  const count = Math.min(Math.max(input.imageCount, 1), 4);

  // Replace this placeholder block with Replicate Flux or another provider.
  const generated = await Promise.all(
    Array.from({ length: count }).map(async (_, index) => {
      const seed = encodeURIComponent(`${input.prompt}-${index}`);
      const placeholder = `https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80&sig=${seed}`;
      const stored = await storeGeneratedImage({
        url: placeholder,
        filename: `${makeId("persona")}.jpg`,
      });
      return stored.url;
    }),
  );

  return generated;
}
