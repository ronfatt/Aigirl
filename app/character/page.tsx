"use client";

import { useEffect, useState } from "react";
import { CharacterCard } from "@/components/CharacterCard";
import { CharacterForm } from "@/components/CharacterForm";
import { Header } from "@/components/Header";
import { LoadingState } from "@/components/LoadingState";
import { Character } from "@/lib/types";

export default function CharacterPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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
          setSelectedCharacterId(payload.characters[0]?.id ?? "");
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

  const activeCharacter =
    characters.find((character) => character.id === selectedCharacterId) ?? characters[0] ?? null;

  async function handleDeleteCharacter() {
    if (!activeCharacter) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/characters/${activeCharacter.id}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to delete character.");
      }

      setCharacters((current) => {
        const next = current.filter((item) => item.id !== activeCharacter.id);
        setSelectedCharacterId(next[0]?.id ?? "");
        return next;
      });
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete character.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <Header
        title="Character"
        description="Define the persona blueprint, visual consistency rules, and social posting voice."
      />

      {loading ? <LoadingState label="Loading persona" /> : null}
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      {!loading ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3 rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
            <select
              value={selectedCharacterId}
              onChange={(event) => setSelectedCharacterId(event.target.value)}
              className="min-w-[220px] rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-white/25"
            >
              {characters.map((character) => (
                <option key={character.id} value={character.id}>
                  {character.displayName}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleDeleteCharacter}
              disabled={!activeCharacter || deleting}
              className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 transition hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting ? "Deleting..." : "Delete character"}
            </button>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
          <CharacterForm
            key={activeCharacter?.id ?? "new-character"}
            initialCharacter={activeCharacter}
            onSaved={(character) => {
              setCharacters((current) => {
                const index = current.findIndex((item) => item.id === character.id);

                if (index === -1) {
                  return [character, ...current];
                }

                const next = [...current];
                next[index] = character;
                setSelectedCharacterId(character.id);
                return next;
              });
            }}
          />
          {activeCharacter ? <CharacterCard character={activeCharacter} /> : null}
        </div>
        </div>
      ) : null}
    </div>
  );
}
