"use client";

import type { ReactNode } from "react";
import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { EmptyState } from "@/components/EmptyState";
import { Header } from "@/components/Header";
import { ImageGrid } from "@/components/ImageGrid";
import { LoadingState } from "@/components/LoadingState";
import { PromptPreview } from "@/components/PromptPreview";
import { SceneSelector } from "@/components/SceneSelector";
import { sceneLibrary } from "@/lib/scene-library";
import { Character, Generation, GenerationHistoryItem } from "@/lib/types";
import { composeImagePrompt } from "@/lib/prompts";
import { formatDate } from "@/lib/utils";

interface GenerateWorkspaceProps {
  initialCharacters: Character[];
  initialHistory: GenerationHistoryItem[];
}

export function GenerateWorkspace({
  initialCharacters,
  initialHistory,
}: GenerateWorkspaceProps) {
  const [characters, setCharacters] = useState<Character[]>(initialCharacters);
  const [history, setHistory] = useState<GenerationHistoryItem[]>(initialHistory);
  const [characterId, setCharacterId] = useState("");
  const [sceneId, setSceneId] = useState(sceneLibrary[0]?.id ?? "");
  const [customPrompt, setCustomPrompt] = useState("");
  const [imageCount, setImageCount] = useState(2);
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [draftPostId, setDraftPostId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [captionOptions, setCaptionOptions] = useState<string[]>([]);
  const [selectedCaption, setSelectedCaption] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingCharacters, setLoadingCharacters] = useState(initialCharacters.length === 0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setCharacterId(
      initialCharacters.find((item) => item.isActive)?.id ?? initialCharacters[0]?.id ?? "",
    );
  }, [initialCharacters]);

  useEffect(() => {
    if (initialCharacters.length && initialHistory.length) {
      return;
    }

    let active = true;

    async function loadInitialData() {
      setLoadingCharacters(true);
      setLoadingHistory(true);

      try {
        const [charactersResponse, historyResponse] = await Promise.all([
          fetch("/api/characters"),
          fetch("/api/generations"),
        ]);

        if (!charactersResponse.ok) {
          throw new Error("Unable to load characters.");
        }

        if (!historyResponse.ok) {
          throw new Error("Unable to load generation history.");
        }

        const charactersPayload = (await charactersResponse.json()) as { characters: Character[] };
        const historyPayload = (await historyResponse.json()) as { generations: GenerationHistoryItem[] };

        if (!active) {
          return;
        }

        setCharacters(charactersPayload.characters);
        setHistory(historyPayload.generations);
        setCharacterId(
          charactersPayload.characters.find((item) => item.isActive)?.id ??
            charactersPayload.characters[0]?.id ??
            "",
        );
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load page.");
        }
      } finally {
        if (active) {
          setLoadingCharacters(false);
          setLoadingHistory(false);
        }
      }
    }

    void loadInitialData();

    return () => {
      active = false;
    };
  }, [initialCharacters, initialHistory]);

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

  async function refreshHistory() {
    setLoadingHistory(true);

    try {
      const response = await fetch("/api/generations");

      if (!response.ok) {
        throw new Error("Unable to load generation history.");
      }

      const payload = (await response.json()) as { generations: GenerationHistoryItem[] };
      setHistory(payload.generations);
    } finally {
      setLoadingHistory(false);
    }
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

  async function handleGenerate() {
    setError(null);
    setSuccessMessage(null);
    setDraftPostId(null);
    setGeneration(null);
    setSelectedImage(null);
    setCaptionOptions([]);
    setSelectedCaption(null);

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

        const payload = (await response.json()) as {
          error?: string;
          generation?: Generation;
        };

        if (!response.ok) {
          throw new Error(payload.error || "Unable to generate images.");
        }
        if (!payload.generation) {
          throw new Error("Generation response was missing data.");
        }
        setGeneration(payload.generation);
        setSelectedImage(payload.generation.selectedImageUrl);
        await refreshHistory();
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
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/generations/${generation.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ selectedImageUrl: imageUrl }),
      });

      if (!response.ok) {
        throw new Error("Unable to approve image.");
      }

      const payload = await response.json();
      setGeneration(payload.generation);
      setDraftPostId(payload.draftPost?.id ?? null);
      setCaptionOptions(payload.draftPost?.captionOptions ?? []);
      setSelectedCaption(payload.draftPost?.caption ?? null);
      await refreshHistory();
      setSuccessMessage(
        payload.draftPost?.id
          ? `Approved image saved. Draft post created: ${payload.draftPost.id}`
          : "Approved image saved.",
      );
    } catch (approvalError) {
      setError(approvalError instanceof Error ? approvalError.message : "Unable to approve image.");
    }
  }

  async function handleSelectCaption(caption: string) {
    if (!draftPostId) {
      return;
    }

    setSelectedCaption(caption);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/posts/${draftPostId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ caption }),
      });

      if (!response.ok) {
        throw new Error("Unable to save caption.");
      }

      setSuccessMessage("Selected caption saved to draft post.");
      await refreshHistory();
    } catch (captionError) {
      setError(captionError instanceof Error ? captionError.message : "Unable to save caption.");
    }
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
              {draftPostId ? (
                <p className="text-sm text-zinc-400">Draft post created: {draftPostId}</p>
              ) : (
                <p className="text-sm text-zinc-500">Draft post will be created after approval.</p>
              )}
            </div>
            {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
            {successMessage ? <p className="mt-3 text-sm text-emerald-300">{successMessage}</p> : null}
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
              <p className="text-sm text-zinc-400">
                Select the approved image to save it and create a draft post.
              </p>
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

      {draftPostId && captionOptions.length ? (
        <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-white">Caption options</h3>
            <p className="text-sm text-zinc-400">
              Pick one caption to save into the draft post. You can still edit it later in Posts.
            </p>
          </div>

          <div className="grid gap-3">
            {captionOptions.map((caption) => {
              const active = caption === selectedCaption;

              return (
                <button
                  key={caption}
                  type="button"
                  onClick={() => handleSelectCaption(caption)}
                  className={`rounded-2xl border px-4 py-4 text-left text-sm transition ${
                    active
                      ? "border-white bg-white text-black"
                      : "border-white/10 bg-black/10 text-zinc-200 hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  {caption}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Generation history</h3>
            <p className="text-sm text-zinc-400">
              Past generations stay in history so you can recover photos and linked post records later.
            </p>
          </div>
          <p className="text-sm text-zinc-500">{history.length} records</p>
        </div>

        {loadingHistory ? <LoadingState label="Refreshing history" /> : null}

        {!loadingHistory && !history.length ? (
          <EmptyState
            title="No generation history yet"
            description="Generate your first image set and it will stay available here."
          />
        ) : null}

        {!loadingHistory && history.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {history.map((item) => {
              const active = generation?.id === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setGeneration(item);
                    setSelectedImage(item.selectedImageUrl);
                    setDraftPostId(item.linkedPostId);
                    setCaptionOptions([]);
                    setSelectedCaption(null);
                    setSuccessMessage(null);
                    setError(null);
                  }}
                  className={`overflow-hidden rounded-[1.4rem] border text-left transition ${
                    active
                      ? "border-white bg-white/[0.06]"
                      : "border-white/10 bg-black/10 hover:border-white/20"
                  }`}
                >
                  <div className="relative h-52 bg-white/5">
                    {item.previewImageUrl ? (
                      <Image
                        src={item.previewImageUrl}
                        alt={item.characterName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{item.characterName}</p>
                        <p className="text-sm text-zinc-400">{item.sceneTitle}</p>
                      </div>
                      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{item.status}</p>
                    </div>
                    <p className="text-xs text-zinc-500">{formatDate(item.createdAt)}</p>
                    <p className="text-sm text-zinc-400">
                      Post: {item.linkedPostId ? `${item.linkedPostId} • ${item.linkedPostStatus}` : "Not created yet"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
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
