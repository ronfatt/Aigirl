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
import { promptPresets } from "@/lib/prompt-presets";
import { getContentMixSummary, getSceneRatioHint } from "@/lib/content-strategy";
import { sceneLibrary } from "@/lib/scene-library";
import {
  Character,
  Generation,
  GenerationHistoryItem,
  SensualPoseBias,
  StyleMode,
} from "@/lib/types";
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
  const sensualSceneIds = [
    "mirror-selfie",
    "hotel-morning",
    "sunset-balcony",
    "poolside",
    "beach-walk",
    "reading-sofa",
    "rainy-window",
    "rooftop-evening",
  ];
  const sensualPoseBiases: Array<{
    value: SensualPoseBias;
    label: string;
    description: string;
  }> = [
    {
      value: "soft glam",
      label: "Soft Glam",
      description: "Gentler facial energy with softer glamour posture.",
    },
    {
      value: "playful",
      label: "Playful",
      description: "Lighter expression, teasing energy, and more relaxed movement.",
    },
    {
      value: "confident",
      label: "Confident",
      description: "Stronger eye contact and a more poised feminine stance.",
    },
  ];
  const styleModes: Array<{ value: StyleMode; label: string; description: string }> = [
    {
      value: "lifestyle",
      label: "Lifestyle",
      description: "Natural everyday persona content with soft candid energy.",
    },
    {
      value: "selfie",
      label: "Selfie",
      description: "More handheld, phone-shot, personal-post framing.",
    },
    {
      value: "sensual",
      label: "Sensual",
      description: "More polished, feminine, and alluring without explicit content.",
    },
  ];
  const [characters, setCharacters] = useState<Character[]>(initialCharacters);
  const [history, setHistory] = useState<GenerationHistoryItem[]>(initialHistory);
  const [characterId, setCharacterId] = useState("");
  const [sceneId, setSceneId] = useState(sceneLibrary[0]?.id ?? "");
  const [mode, setMode] = useState<StyleMode>("lifestyle");
  const [sensualPoseBias, setSensualPoseBias] = useState<SensualPoseBias>("soft glam");
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedPresetId, setSelectedPresetId] = useState<string>("");
  const [imageCount, setImageCount] = useState(2);
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [draftPostId, setDraftPostId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [captionOptions, setCaptionOptions] = useState<string[]>([]);
  const [selectedCaption, setSelectedCaption] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
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
        const charactersResponse = await fetch("/api/characters");

        if (!charactersResponse.ok) {
          throw new Error("Unable to load characters.");
        }

        const charactersPayload = (await charactersResponse.json()) as { characters: Character[] };

        if (!active) {
          return;
        }

        setCharacters(charactersPayload.characters);
        setCharacterId(
          charactersPayload.characters.find((item) => item.isActive)?.id ??
            charactersPayload.characters[0]?.id ??
            "",
        );

        try {
          const historyResponse = await fetch("/api/generations");

          if (!historyResponse.ok) {
            const payload = (await historyResponse.json()) as { error?: string };
            throw new Error(payload.error || "Unable to load generation history.");
          }

          const historyPayload = (await historyResponse.json()) as {
            generations: GenerationHistoryItem[];
          };

          if (active) {
            setHistory(historyPayload.generations);
            setHistoryError(null);
          }
        } catch (historyLoadError) {
          if (active) {
            setHistory([]);
            setHistoryError(
              historyLoadError instanceof Error
                ? historyLoadError.message
                : "Unable to load generation history.",
            );
          }
        }
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
  const sensualScenes = sceneLibrary.filter((scene) => sensualSceneIds.includes(scene.id));
  const visiblePresets = promptPresets.filter(
    (preset) => !preset.modes || preset.modes.includes(mode),
  );
  const contentMix = getContentMixSummary(history);
  const sceneRatioHint = currentScene ? getSceneRatioHint(currentScene) : null;
  const promptPreview =
    currentCharacter && currentScene
      ? composeImagePrompt({
          character: currentCharacter,
          scene: currentScene,
          customPrompt,
          mode,
          sensualPoseBias,
        })
      : "Select an active character to preview the prompt.";

  function applyPreset(presetId: string) {
    const preset = promptPresets.find((item) => item.id === presetId);

    if (!preset) {
      return;
    }

    setSelectedPresetId(preset.id);
    setCustomPrompt(preset.prompt);
  }

  async function refreshHistory() {
    setLoadingHistory(true);

    try {
      const response = await fetch("/api/generations");

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "Unable to load generation history.");
      }

      const payload = (await response.json()) as { generations: GenerationHistoryItem[] };
      setHistory(payload.generations);
      setHistoryError(null);
    } catch (refreshError) {
      setHistoryError(
        refreshError instanceof Error
          ? refreshError.message
          : "Unable to load generation history.",
      );
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
            mode,
            sensualPoseBias,
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

            <div className="mt-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-medium text-white">Style mode</h3>
                  <p className="mt-1 text-xs text-zinc-400">
                    Choose how the scene should feel before prompt overrides are applied.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {styleModes.map((item) => {
                  const active = item.value === mode;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setMode(item.value)}
                      className={`rounded-2xl border px-4 py-4 text-left transition ${
                        active
                          ? "border-white/30 bg-white/10"
                          : "border-white/10 bg-black/10 hover:bg-white/[0.06]"
                      }`}
                    >
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="mt-2 text-xs leading-5 text-zinc-400">{item.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {mode === "sensual" ? (
              <div className="mt-5 rounded-2xl border border-rose-300/15 bg-rose-400/[0.04] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-white">Sensual scene recommendations</h3>
                    <p className="mt-1 text-xs leading-5 text-zinc-400">
                      These scenes are tuned for a softer, more alluring result without pushing into explicit content.
                    </p>
                  </div>
                  <span className="rounded-full border border-rose-200/15 bg-rose-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-rose-200">
                    Sensual mode
                  </span>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {sensualScenes.map((scene) => {
                    const active = scene.id === sceneId;

                    return (
                      <button
                        key={scene.id}
                        type="button"
                        onClick={() => setSceneId(scene.id)}
                        className={`rounded-2xl border px-4 py-4 text-left transition ${
                          active
                            ? "border-rose-200/30 bg-rose-200/12"
                            : "border-white/10 bg-black/10 hover:border-rose-200/20 hover:bg-white/[0.06]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-white">{scene.title}</p>
                            <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                              {scene.category}
                            </p>
                          </div>
                        </div>
                        <p className="mt-3 text-xs leading-5 text-zinc-400">{scene.captionHint}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {mode === "sensual" ? (
              <div className="mt-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-medium text-white">Sensual pose bias</h3>
                    <p className="mt-1 text-xs text-zinc-400">
                      Shift the expression and body language before the random pose variants are chosen.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {sensualPoseBiases.map((item) => {
                    const active = item.value === sensualPoseBias;

                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setSensualPoseBias(item.value)}
                        className={`rounded-2xl border px-4 py-4 text-left transition ${
                          active
                            ? "border-rose-200/30 bg-rose-200/12"
                            : "border-white/10 bg-black/10 hover:bg-white/[0.06]"
                        }`}
                      >
                        <p className="text-sm font-medium text-white">{item.label}</p>
                        <p className="mt-2 text-xs leading-5 text-zinc-400">{item.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <Field label="Custom prompt override">
              <textarea
                value={customPrompt}
                onChange={(event) => setCustomPrompt(event.target.value)}
                rows={4}
                className={`${inputClassName} resize-none`}
                placeholder="Optional direction for this specific scene."
              />
            </Field>

            <div className="mt-5">
              <div className="mb-5 rounded-2xl border border-white/10 bg-black/10 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-white">Content ratio strategy</h3>
                    <p className="mt-1 text-xs text-zinc-400">
                      Target mix: 35% selfie, 25% lifestyle, 20% travel, 10% gym, 10% sexy.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSceneId(contentMix.recommendedScene.id)}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10"
                  >
                    Use recommended scene: {contentMix.recommendedScene.title}
                  </button>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-5">
                  {contentMix.buckets.map((bucket) => (
                    <div key={bucket.bucket} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{bucket.label}</p>
                      <p className="mt-2 text-sm text-white">{bucket.actualPercent}%</p>
                      <p className="text-xs text-zinc-400">Target {bucket.targetPercent}%</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-medium text-white">Prompt presets</h3>
                  <p className="mt-1 text-xs text-zinc-400">
                    {mode === "sensual"
                      ? "Sensual mode presets focus on softer glamour, fitted styling, and more alluring scene direction."
                      : "Click a preset to fill the custom override with a reusable body/style prompt."}
                  </p>
                </div>
                {selectedPresetId ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPresetId("");
                      setCustomPrompt("");
                    }}
                    className="text-xs text-zinc-400 transition hover:text-white"
                  >
                    Clear preset
                  </button>
                ) : null}
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {visiblePresets.map((preset) => {
                  const isSelected = preset.id === selectedPresetId;

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPreset(preset.id)}
                      className={`rounded-2xl border px-4 py-4 text-left transition ${
                        isSelected
                          ? "border-white/30 bg-white/10"
                          : "border-white/10 bg-black/10 hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-white">{preset.title}</p>
                        <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                          {preset.category}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-zinc-400">{preset.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

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
                <p className="text-sm text-zinc-500">
                  {sceneRatioHint
                    ? `${sceneRatioHint.label} content. Draft post will be created after approval.`
                    : "Draft post will be created after approval."}
                </p>
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
            onPreview={setPreviewImageUrl}
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

        {historyError ? <p className="mb-4 text-sm text-amber-300">{historyError}</p> : null}

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

                    {item.imageUrls.length ? (
                      <div className="grid grid-cols-4 gap-2 pt-2">
                        {item.imageUrls.slice(0, 4).map((imageUrl) => (
                          <button
                            key={imageUrl}
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setPreviewImageUrl(imageUrl);
                            }}
                            className="relative aspect-[4/5] overflow-hidden rounded-xl border border-white/10 bg-white/5"
                          >
                            <Image
                              src={imageUrl}
                              alt={`${item.characterName} history`}
                              fill
                              className="object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {previewImageUrl ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-[1.6rem] border border-white/10 bg-black"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImageUrl(null)}
              className="absolute right-4 top-4 z-10 rounded-full border border-white/15 bg-black/50 px-3 py-1 text-sm text-white transition hover:bg-black/70"
            >
              Close
            </button>
            <div className="relative aspect-[4/5] w-full bg-black">
              <Image src={previewImageUrl} alt="Preview" fill className="object-contain" />
            </div>
          </div>
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
