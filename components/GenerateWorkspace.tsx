"use client";

import type { ReactNode } from "react";
import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { Header } from "@/components/Header";
import { ImageGrid } from "@/components/ImageGrid";
import { LoadingState } from "@/components/LoadingState";
import { PromptPreview } from "@/components/PromptPreview";
import { SceneSelector } from "@/components/SceneSelector";
import { VideoDraftBuilder } from "@/components/VideoDraftBuilder";
import { promptPresets } from "@/lib/prompt-presets";
import { getContentMixSummary, getSceneRatioHint } from "@/lib/content-strategy";
import { buildIdentityReview } from "@/lib/identity-review";
import { sceneLibrary } from "@/lib/scene-library";
import {
  Character,
  Generation,
  GenerationHistoryItem,
  QualityTag,
  SensualPoseBias,
  StyleMode,
  VideoClipDraft,
} from "@/lib/types";
import { composeImagePrompt } from "@/lib/prompts";
import { formatDate } from "@/lib/utils";

interface GenerateWorkspaceProps {
  initialCharacters: Character[];
  initialHistory: GenerationHistoryItem[];
  initialSceneId?: string | null;
  initialMode?: StyleMode | null;
}

export function GenerateWorkspace({
  initialCharacters,
  initialHistory,
  initialSceneId,
  initialMode,
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
  const [sensualSexyTarget, setSensualSexyTarget] = useState(15);
  const [showAdvanced, setShowAdvanced] = useState(false);
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
  const [clipMessage, setClipMessage] = useState<string | null>(null);
  const [historyModeFilter, setHistoryModeFilter] = useState<StyleMode | "all">("all");
  const [historySceneFilter, setHistorySceneFilter] = useState<string>("all");
  const [historyStatusFilter, setHistoryStatusFilter] =
    useState<Generation["status"] | "all">("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [approvedOnly, setApprovedOnly] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingCharacters, setLoadingCharacters] = useState(initialCharacters.length === 0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (initialSceneId && sceneLibrary.some((scene) => scene.id === initialSceneId)) {
      setSceneId(initialSceneId);
    }

    if (initialMode === "lifestyle" || initialMode === "selfie" || initialMode === "sensual") {
      setMode(initialMode);
    }
  }, [initialMode, initialSceneId]);

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
  const quickScenes = sceneLibrary.slice(0, 6);
  const contentMix = getContentMixSummary(history, mode, sensualSexyTarget);
  const sceneRatioHint = currentScene ? getSceneRatioHint(currentScene, mode, sensualSexyTarget) : null;
  const filteredHistory = history.filter((item) => {
    if (!showArchived && item.isArchived) return false;
    if (historyModeFilter !== "all" && item.mode !== historyModeFilter) return false;
    if (historySceneFilter !== "all" && item.sceneTemplateId !== historySceneFilter) return false;
    if (historyStatusFilter !== "all" && item.status !== historyStatusFilter) return false;
    if (favoritesOnly && !item.isFavorite) return false;
    if (approvedOnly && item.status !== "approved") return false;
    return true;
  });
  const promptPreview =
    currentCharacter && currentScene
      ? composeImagePrompt({
          character: currentCharacter,
          scene: currentScene,
          customPrompt,
          mode,
          sensualPoseBias,
          imageCount,
        })
      : "Select an active character to preview the prompt.";
  const referenceSlotCount = currentCharacter
    ? [
        currentCharacter.masterReferenceImageUrl,
        currentCharacter.faceReferenceImageUrl,
        currentCharacter.styleReferenceImageUrl,
        currentCharacter.bodyReferenceImageUrl,
      ].filter(Boolean).length
    : 0;
  const currentIdentityReview =
    currentCharacter && generation
      ? buildIdentityReview({
          character: currentCharacter,
          mode: generation.mode,
          shotType: generation.shotType,
          qualityTags: generation.qualityTags,
        })
      : null;

  function applyPreset(presetId: string) {
    const preset = promptPresets.find((item) => item.id === presetId);

    if (!preset) {
      return;
    }

    setSelectedPresetId(preset.id);
    if (preset.mode) {
      setMode(preset.mode);
    }
    if (preset.sceneId) {
      setSceneId(preset.sceneId);
    }
    if (preset.imageCount) {
      setImageCount(preset.imageCount);
    }
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

  async function updateHistoryItem(
    generationId: string,
    payload: { isFavorite?: boolean; isArchived?: boolean; qualityTags?: QualityTag[] },
  ) {
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/generations/${generationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        throw new Error(result.error || "Unable to update generation.");
      }

      await refreshHistory();
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Unable to update generation.");
    }
  }

  async function createDraftFromHistory(generationId: string) {
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/generations/${generationId}`, {
        method: "POST",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to create asset draft.");
      }

      setGeneration(payload.generation);
      setDraftPostId(payload.draftPost?.id ?? null);
      setSelectedImage(payload.generation?.selectedImageUrl ?? null);
      setCaptionOptions(payload.draftPost?.captionOptions ?? []);
      setSelectedCaption(payload.draftPost?.caption ?? null);
      setSuccessMessage(
        payload.draftPost?.id
          ? `Asset draft created: ${payload.draftPost.id}`
          : "Asset draft created.",
      );
      await refreshHistory();
    } catch (draftError) {
      setError(draftError instanceof Error ? draftError.message : "Unable to create asset draft.");
    }
  }

  async function deleteHistoryItem(generationId: string) {
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/generations/${generationId}`, {
        method: "DELETE",
      });
      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to delete generation.");
      }

      if (generation?.id === generationId) {
        setGeneration(null);
        setDraftPostId(null);
        setSelectedImage(null);
        setCaptionOptions([]);
        setSelectedCaption(null);
      }

      setSuccessMessage("Generation deleted.");
      await refreshHistory();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete generation.");
    }
  }

  async function toggleQualityTag(generationItem: Generation, tag: QualityTag) {
    const nextTags = generationItem.qualityTags.includes(tag)
      ? generationItem.qualityTags.filter((item) => item !== tag)
      : [...generationItem.qualityTags, tag];

    await updateHistoryItem(generationItem.id, { qualityTags: nextTags });

    if (generation?.id === generationItem.id) {
      setGeneration({
        ...generationItem,
        qualityTags: nextTags,
      });
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
    setClipMessage(null);

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
            identityLockStrength: currentCharacter?.identityLockStrength,
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
          ? `Approved image saved. Asset draft created: ${payload.draftPost.id}`
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

      setSuccessMessage("Selected caption saved to asset draft.");
      await refreshHistory();
    } catch (captionError) {
      setError(captionError instanceof Error ? captionError.message : "Unable to save caption.");
    }
  }

  return (
    <div>
      <Header
        title="Create"
        description="Pick a persona, choose a scene, generate a few stills, then approve the best one."
      />

      <div className="space-y-6">
        <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Quick create</h3>
              <p className="mt-1 text-sm text-zinc-400">
                Use this first. Advanced prompt controls are available below if you need them.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAdvanced((value) => !value)}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white transition hover:bg-white/[0.08]"
            >
              {showAdvanced ? "Hide advanced" : "Show advanced"}
            </button>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Persona">
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

            <Field label="Mode">
              <select
                value={mode}
                onChange={(event) => setMode(event.target.value as StyleMode)}
                className={inputClassName}
              >
                {styleModes.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Scene">
              <select
                value={sceneId}
                onChange={(event) => setSceneId(event.target.value)}
                className={inputClassName}
              >
                {sceneLibrary.map((scene) => (
                  <option key={scene.id} value={scene.id}>
                    {scene.title}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="How many">
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

          {currentCharacter ? (
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Identity lock</p>
                <p className="mt-2 text-sm font-medium text-white">{currentCharacter.identityLockStrength}</p>
                <p className="mt-1 text-xs text-zinc-400">Higher lock keeps the same face more aggressively.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Reference slots</p>
                <p className="mt-2 text-sm font-medium text-white">{referenceSlotCount}</p>
                <p className="mt-1 text-xs text-zinc-400">Face, style, and body references all support consistency.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Look profile</p>
                <p className="mt-2 text-sm font-medium text-white">{currentCharacter.lookProfile}</p>
                <p className="mt-1 text-xs text-zinc-400">The persona&apos;s default visual lane before scene-specific styling is applied.</p>
              </div>
              <LinkCard href="/character" title="Refine persona" description="Add more references or raise the identity lock." />
            </div>
          ) : null}

          <div className="mt-5">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Quick scenes</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {quickScenes.map((scene) => (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() => setSceneId(scene.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    scene.id === sceneId
                      ? "border-white/30 bg-white/10 text-white"
                      : "border-white/10 bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-white"
                  }`}
                >
                  {scene.title}
                </button>
              ))}
            </div>
          </div>

          {selectedPresetId === "flux-street-daylight" ? (
            <div className="mt-5 rounded-2xl border border-sky-300/15 bg-sky-300/[0.05] p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-sky-200">Flux target</p>
                  <h4 className="mt-2 text-sm font-medium text-white">Street daylight carousel mode</h4>
                  <p className="mt-2 max-w-2xl text-xs leading-5 text-zinc-300">
                    This preset is tuned toward the `Flux.jpg` reference style: short dark street-style hair,
                    white shirt, black mini skirt, daylight city framing, and a cleaner candid lookbook mood instead of
                    indoor glamour portrait styling.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-right">
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Recommended setup</p>
                  <p className="mt-2 text-sm text-white">Use `High` identity lock</p>
                  <p className="mt-1 text-xs text-zinc-400">Best with a face reference that already matches the short-hair look.</p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isPending || !characterId}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-black transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Generating..." : "Generate Images"}
            </button>
            {draftPostId ? (
              <p className="text-sm text-zinc-400">Asset draft created: {draftPostId}</p>
            ) : (
              <p className="text-sm text-zinc-500">
                {sceneRatioHint
                  ? `${sceneRatioHint.label} content. Asset draft will be created after approval.`
                  : "Asset draft will be created after approval."}
              </p>
            )}
          </div>
          {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
          {successMessage ? <p className="mt-3 text-sm text-emerald-300">{successMessage}</p> : null}
        </div>

        {showAdvanced ? (
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

            {mode === "sensual" ? (
              <div className="mt-5 rounded-2xl border border-rose-300/15 bg-rose-400/[0.04] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-white">Sexy target</h3>
                    <p className="mt-1 text-xs text-zinc-400">
                      Base target starts at 15%. Raise it up to 30% for a more sensual content mix.
                    </p>
                  </div>
                  <p className="text-sm font-medium text-rose-200">{sensualSexyTarget}%</p>
                </div>

                <input
                  type="range"
                  min={15}
                  max={30}
                  step={1}
                  value={sensualSexyTarget}
                  onChange={(event) => setSensualSexyTarget(Number(event.target.value))}
                  className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-rose-300"
                />

                <div className="mt-2 flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                  <span>Base 15%</span>
                  <span>Max 30%</span>
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
                      Target mix: {contentMix.mixLabel}.
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
                <p className="text-sm text-zinc-400">Asset draft created: {draftPostId}</p>
              ) : (
                <p className="text-sm text-zinc-500">
                  {sceneRatioHint
                    ? `${sceneRatioHint.label} content. Asset draft will be created after approval.`
                    : "Asset draft will be created after approval."}
                </p>
              )}
            </div>
            {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
            {successMessage ? <p className="mt-3 text-sm text-emerald-300">{successMessage}</p> : null}
          </div>

          <PromptPreview prompt={promptPreview} />
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">All scenes</h3>
            <SceneSelector scenes={sceneLibrary} selectedSceneId={sceneId} onSelect={setSceneId} />
          </div>
        </div>
        ) : null}
      </div>

      {generation ? (
        <div className="mt-8 rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Generated images</h3>
              <p className="text-sm text-zinc-400">
                Select the approved image to save it and create an asset draft.
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
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-medium text-white">Quality review</h4>
                <p className="mt-1 text-xs text-zinc-400">
                  Tag the current generation so the library is easier to filter later.
                </p>
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                {generation.mode} • {generation.shotType}
              </p>
            </div>

            {currentIdentityReview ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Identity review</p>
                    <p className="mt-1 text-sm text-zinc-300">{currentIdentityReview.summary}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs uppercase tracking-[0.18em] ${getIdentityLevelClassName(currentIdentityReview.level)}`}>
                      {currentIdentityReview.level}
                    </p>
                    <p className="mt-1 text-sm text-white">{currentIdentityReview.confidence}% confidence</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-zinc-400">{currentIdentityReview.recommendation}</p>
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              {(["face stable", "off-identity risk", "framing good", "background clear", "publish-ready"] as QualityTag[]).map((tag) => {
                const active = generation.qualityTags.includes(tag);

                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => void toggleQualityTag(generation, tag)}
                    className={`rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.18em] transition ${
                      active
                        ? "border-white/25 bg-white/10 text-white"
                        : "border-white/10 bg-white/[0.04] text-zinc-400"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {generation?.selectedImageUrl ? (
        <VideoDraftBuilder
          generationId={generation.id}
          imageUrl={generation.selectedImageUrl}
          characterName={currentCharacter?.displayName ?? "Persona"}
          sceneTitle={currentScene?.title ?? "Clip"}
          onClipSaved={(clip: VideoClipDraft) => {
            setClipMessage(`Saved clip draft: ${clip.id}`);
          }}
        />
      ) : null}

      {clipMessage ? <p className="mt-3 text-sm text-emerald-300">{clipMessage}</p> : null}

      {draftPostId && captionOptions.length ? (
        <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-white">Caption drafts</h3>
            <p className="text-sm text-zinc-400">
              Pick one caption to save into the asset draft. You can still tune it later in Exports.
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
              Past generations stay in history so you can recover photos, caption drafts, and clip-ready assets later.
            </p>
          </div>
          <p className="text-sm text-zinc-500">{filteredHistory.length} / {history.length} records</p>
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <select
            value={historyModeFilter}
            onChange={(event) => setHistoryModeFilter(event.target.value as StyleMode | "all")}
            className={inputClassName}
          >
            <option value="all">All modes</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="selfie">Selfie</option>
            <option value="sensual">Sensual</option>
          </select>
          <select
            value={historySceneFilter}
            onChange={(event) => setHistorySceneFilter(event.target.value)}
            className={inputClassName}
          >
            <option value="all">All scenes</option>
            {sceneLibrary.map((scene) => (
              <option key={scene.id} value={scene.id}>
                {scene.title}
              </option>
            ))}
          </select>
          <select
            value={historyStatusFilter}
            onChange={(event) =>
              setHistoryStatusFilter(event.target.value as Generation["status"] | "all")
            }
            className={inputClassName}
          >
            <option value="all">All statuses</option>
            <option value="completed">Completed</option>
            <option value="approved">Approved</option>
            <option value="failed">Failed</option>
          </select>
          <button
            type="button"
            onClick={() => setFavoritesOnly((value) => !value)}
            className={`rounded-2xl border px-4 py-3 text-sm transition ${
              favoritesOnly ? "border-white/30 bg-white/10 text-white" : "border-white/10 bg-black/10 text-zinc-400"
            }`}
          >
            Favorites only
          </button>
          <button
            type="button"
            onClick={() => setApprovedOnly((value) => !value)}
            className={`rounded-2xl border px-4 py-3 text-sm transition ${
              approvedOnly ? "border-white/30 bg-white/10 text-white" : "border-white/10 bg-black/10 text-zinc-400"
            }`}
          >
            Approved only
          </button>
          <button
            type="button"
            onClick={() => setShowArchived((value) => !value)}
            className={`rounded-2xl border px-4 py-3 text-sm transition ${
              showArchived ? "border-white/30 bg-white/10 text-white" : "border-white/10 bg-black/10 text-zinc-400"
            }`}
          >
            {showArchived ? "Hide archive" : "Show archive"}
          </button>
        </div>

        {historyError ? <p className="mb-4 text-sm text-amber-300">{historyError}</p> : null}

        {loadingHistory ? <LoadingState label="Refreshing history" /> : null}

        {!loadingHistory && !filteredHistory.length ? (
          <EmptyState
            title="No matching generations"
            description="Adjust filters or generate a new image set to populate this library."
          />
        ) : null}

        {!loadingHistory && filteredHistory.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredHistory.map((item) => {
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
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">{item.characterName}</p>
                          {item.isFavorite ? (
                            <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-amber-200">
                              Favorite
                            </span>
                          ) : null}
                          {item.isArchived ? (
                            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                              Archived
                            </span>
                          ) : null}
                        </div>
                        <p className="text-sm text-zinc-400">{item.sceneTitle}</p>
                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                          {item.mode} • {item.shotType}
                        </p>
                        {item.identityReview ? (
                          <p className={`mt-2 text-[11px] uppercase tracking-[0.18em] ${getIdentityLevelClassName(item.identityReview.level)}`}>
                            {item.identityReview.level} • {item.identityReview.confidence}% identity confidence
                          </p>
                        ) : null}
                      </div>
                      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{item.status}</p>
                    </div>
                    <p className="text-xs text-zinc-500">{formatDate(item.createdAt)}</p>
                    <p className="text-sm text-zinc-400">
                      Post: {item.linkedPostId ? `${item.linkedPostId} • ${item.linkedPostStatus}` : "Not created yet"}
                    </p>
                    {item.identityReview ? (
                      <p className="text-xs text-zinc-500">{item.identityReview.recommendation}</p>
                    ) : null}
                    {item.qualityTags.length ? (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {item.qualityTags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}

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

                    <div className="flex flex-wrap gap-2 pt-3">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          void updateHistoryItem(item.id, { isFavorite: !item.isFavorite });
                        }}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white transition hover:bg-white/[0.08]"
                      >
                        {item.isFavorite ? "Unfavorite" : "Favorite"}
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          void updateHistoryItem(item.id, { isArchived: !item.isArchived });
                        }}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white transition hover:bg-white/[0.08]"
                      >
                        {item.isArchived ? "Unarchive" : "Archive"}
                      </button>
                      {!item.linkedPostId ? (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            void createDraftFromHistory(item.id);
                          }}
                          className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs text-emerald-200 transition hover:bg-emerald-300/15"
                        >
                          Create draft
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          void deleteHistoryItem(item.id);
                        }}
                        className="rounded-full border border-rose-300/20 bg-rose-300/10 px-3 py-1.5 text-xs text-rose-200 transition hover:bg-rose-300/15"
                      >
                        Delete
                      </button>
                    </div>
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

function LinkCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-white/10 bg-black/10 p-4 transition hover:bg-white/[0.05]"
    >
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Shortcut</p>
      <p className="mt-2 text-sm font-medium text-white">{title}</p>
      <p className="mt-1 text-xs text-zinc-400">{description}</p>
    </Link>
  );
}

function getIdentityLevelClassName(level: "stable" | "review" | "high-risk") {
  if (level === "stable") {
    return "text-emerald-300";
  }

  if (level === "review") {
    return "text-amber-200";
  }

  return "text-rose-300";
}

const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-white/25";
