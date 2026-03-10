"use client";

import type { ReactNode } from "react";
import { useEffect, useState, useTransition } from "react";
import { Header } from "@/components/Header";
import { ImageGrid } from "@/components/ImageGrid";
import { LoadingState } from "@/components/LoadingState";
import { PromptPreview } from "@/components/PromptPreview";
import { SceneSelector } from "@/components/SceneSelector";
import { sceneLibrary } from "@/lib/scene-library";
import { Character, Generation } from "@/lib/types";
import { composeImagePrompt } from "@/lib/prompts";

export default function GeneratePage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [characterId, setCharacterId] = useState("");
  const [sceneId, setSceneId] = useState(sceneLibrary[0]?.id ?? "");
  const [customPrompt, setCustomPrompt] = useState("");
  const [imageCount, setImageCount] = useState(2);
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [draftPostId, setDraftPostId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingCharacters, setLoadingCharacters] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;

    async function loadCharacters() {
      try {
        const response = await fetch("/api/characters");
        const payload = await response.json();
        const nextCharacters = payload.characters as Character[];

        if (!active) {
          return;
        }

        setCharacters(nextCharacters);
        setCharacterId(
          nextCharacters.find((item) => item.isActive)?.id ?? nextCharacters[0]?.id ?? "",
        );
      } finally {
        if (active) {
          setLoadingCharacters(false);
        }
      }
    }

    void loadCharacters();

    return () => {
      active = false;
    };
  }, []);

  const currentCharacter = characters.find((item) => item.id === characterId) ?? null;
  const currentScene = sceneLibrary.find((item) => item.id === sceneId) ?? sceneLibrary[0];
  const promptPreview =
    currentCharacter && currentScene
      ? composeImagePrompt({
          character: currentCharacter,
          scene: currentScene,
          customPrompt,
        })
      : "Select an active character to preview the prompt.";

  async function handleGenerate() {
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/generate-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            characterId,
            sceneTemplateId: sceneId,
            customPrompt,
            imageCount,
          }),
        });

        if (!response.ok) {
          throw new Error("Unable to generate images.");
        }

        const payload = await response.json();
        setGeneration(payload.generation);
        setDraftPostId(payload.draftPost.id);
        setSelectedImage(payload.generation.selectedImageUrl);
      } catch (generationError) {
        setError(generationError instanceof Error ? generationError.message : "Generation failed.");
      }
    });
  }

  async function handleSelectImage(imageUrl: string) {
    if (!generation) {
      return;
    }

    setSelectedImage(imageUrl);

    await fetch(`/api/generations/${generation.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ selectedImageUrl: imageUrl }),
    });
  }

  if (loadingCharacters) {
    return (
      <div>
        <Header
          title="Generate"
          description="Choose one active persona, merge it with a scene template, and create draft visuals for review."
        />
        <LoadingState label="Loading personas" />
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Generate"
        description="Choose one active persona, merge it with a scene template, and create draft visuals for review."
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <div className="space-y-6">
          <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Active character">
                <select
                  value={characterId}
                  onChange={(event) => setCharacterId(event.target.value)}
                  className={inputClassName}
                >
                  {characters.map((character) => (
                    <option key={character.id} value={character.id}>
                      {character.displayName}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Image count">
                <select
                  value={imageCount}
                  onChange={(event) => setImageCount(Number(event.target.value))}
                  className={inputClassName}
                >
                  {[1, 2, 3, 4].map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Custom prompt override">
              <textarea
                value={customPrompt}
                onChange={(event) => setCustomPrompt(event.target.value)}
                rows={4}
                className={`${inputClassName} resize-none`}
                placeholder="Optional direction for this specific scene."
              />
            </Field>

            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isPending || !characterId}
                className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-black transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "Generating..." : "Generate Images"}
              </button>
              {draftPostId ? <p className="text-sm text-zinc-400">Draft post created: {draftPostId}</p> : null}
            </div>
            {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
          </div>

          <PromptPreview prompt={promptPreview} />
        </div>

        <SceneSelector scenes={sceneLibrary} selectedSceneId={sceneId} onSelect={setSceneId} />
      </div>

      {generation ? (
        <div className="mt-8 rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Generated images</h3>
              <p className="text-sm text-zinc-400">Select the approved image for downstream publishing.</p>
            </div>
            <p className="text-sm text-zinc-500">Status: {generation.status}</p>
          </div>
          <ImageGrid
            images={generation.imageUrls}
            selectedImage={selectedImage}
            onSelect={handleSelectImage}
          />
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm text-zinc-300">
      <span className="text-zinc-400">{label}</span>
      {children}
    </label>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-white/25";
