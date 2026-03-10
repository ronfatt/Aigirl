import { CharacterCard } from "@/components/CharacterCard";
import { CharacterForm } from "@/components/CharacterForm";
import { Header } from "@/components/Header";
import { listCharacters } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CharacterPage() {
  const characters = await listCharacters();
  const activeCharacter = characters[0] ?? null;

  return (
    <div>
      <Header
        title="Character"
        description="Define the persona blueprint, visual consistency rules, and social posting voice."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <CharacterForm initialCharacter={activeCharacter} />
        {activeCharacter ? <CharacterCard character={activeCharacter} /> : null}
      </div>
    </div>
  );
}
