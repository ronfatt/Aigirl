"use client";

import { useEffect, useState } from "react";
import { CharacterCard } from "@/components/CharacterCard";
import { CharacterForm } from "@/components/CharacterForm";
import { Header } from "@/components/Header";
import { LoadingState } from "@/components/LoadingState";
import { Character } from "@/lib/types";

export default function CharacterPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadCharacters() {
      try {
        const response = await fetch("/api/characters");

        if (!response.ok) {
          throw new Error("Unable to load characters.");
        }

        const payload = (await response.json()) as { characters: Character[] };

        if (active) {
          setCharacters(payload.characters);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load characters.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadCharacters();

    return () => {
      active = false;
    };
  }, []);

  const activeCharacter = characters[0] ?? null;

  return (
    <div>
      <Header
        title="Character"
        description="Define the persona blueprint, visual consistency rules, and social posting voice."
      />

      {loading ? <LoadingState label="Loading persona" /> : null}
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      {!loading ? (
        <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
          <CharacterForm
            initialCharacter={activeCharacter}
            onSaved={(character) => {
              setCharacters((current) => {
                const index = current.findIndex((item) => item.id === character.id);

                if (index === -1) {
                  return [character, ...current];
                }

                const next = [...current];
                next[index] = character;
                return next;
              });
            }}
          />
          {activeCharacter ? <CharacterCard character={activeCharacter} /> : null}
        </div>
      ) : null}
    </div>
  );
}
