import { GenerateWorkspace } from "@/components/GenerateWorkspace";
import { StyleMode } from "@/lib/types";

export default async function GeneratePage({
  searchParams,
}: {
  searchParams?: Promise<{ sceneId?: string; mode?: StyleMode }>;
}) {
  const params = await searchParams;

  return (
    <GenerateWorkspace
      initialCharacters={[]}
      initialHistory={[]}
      initialSceneId={params?.sceneId ?? null}
      initialMode={params?.mode ?? null}
    />
  );
}
