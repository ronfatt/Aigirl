import { NextResponse } from "next/server";
import { getDatabaseSnapshot } from "@/lib/db";
import { buildIdentityReview, getCharacterReferenceSlotCount } from "@/lib/identity-review";
import { sceneLibrary } from "@/lib/scene-library";
import { GenerationHistoryItem } from "@/lib/types";

export async function GET() {
  try {
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
        identityLockStrength: character?.identityLockStrength ?? "balanced",
        referenceSlotCount: character ? getCharacterReferenceSlotCount(character) : 0,
        identityReview: character
          ? buildIdentityReview({
              character,
              mode: generation.mode,
              shotType: generation.shotType,
              qualityTags: generation.qualityTags,
            })
          : undefined,
      };
    });

    return NextResponse.json({
      generations,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load generation history." },
      { status: 503 },
    );
  }
}
