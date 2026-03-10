import { GenerateWorkspace } from "@/components/GenerateWorkspace";
import { getDatabaseSnapshot, listCharacters } from "@/lib/db";
import { sceneLibrary } from "@/lib/scene-library";
import { GenerationHistoryItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function GeneratePage() {
  const [characters, snapshot] = await Promise.all([listCharacters(), getDatabaseSnapshot()]);

  const history: GenerationHistoryItem[] = snapshot.generations.map((generation) => {
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

  return <GenerateWorkspace initialCharacters={characters} initialHistory={history} />;
}
