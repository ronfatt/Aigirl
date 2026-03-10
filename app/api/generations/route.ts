import { NextResponse } from "next/server";
import { getDatabaseSnapshot } from "@/lib/db";
import { sceneLibrary } from "@/lib/scene-library";
import { GenerationHistoryItem } from "@/lib/types";

export async function GET() {
  const snapshot = await getDatabaseSnapshot();

  const generations: GenerationHistoryItem[] = snapshot.generations.map((generation) => {
    const character = snapshot.characters.find((item) => item.id === generation.characterId);
    const scene = sceneLibrary.find((item) => item.id === generation.sceneTemplateId);
    const linkedPost = snapshot.posts.find((item) => item.generationId === generation.id) ?? null;

    return {
      ...generation,
      characterName: character?.displayName ?? "Unknown persona",
      sceneTitle: scene?.title ?? "Unknown scene",
      previewImageUrl: generation.selectedImageUrl ?? generation.imageUrls[0] ?? null,
      linkedPostId: linkedPost?.id ?? null,
      linkedPostStatus: linkedPost?.status ?? null,
    };
  });

  return NextResponse.json({
    generations,
  });
}
