"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { Header } from "@/components/Header";
import { LoadingState } from "@/components/LoadingState";
import { StatusBadge } from "@/components/StatusBadge";
import { sceneLibrary } from "@/lib/scene-library";
import { GenerationHistoryItem, QualityTag, StyleMode, VideoClipDraft } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function GalleryWorkspace() {
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);
  const [videoClips, setVideoClips] = useState<VideoClipDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [modeFilter, setModeFilter] = useState<StyleMode | "all">("all");
  const [sceneFilter, setSceneFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<GenerationHistoryItem["status"] | "all">("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [approvedOnly, setApprovedOnly] = useState(false);
  const [publishReadyOnly, setPublishReadyOnly] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  async function loadHistory() {
    setLoading(true);
    setError(null);

    try {
      const [generationResponse, clipResponse] = await Promise.all([
        fetch("/api/generations"),
        fetch("/api/video-clips"),
      ]);
      const generationPayload = (await generationResponse.json()) as {
        generations?: GenerationHistoryItem[];
        error?: string;
      };
      const clipPayload = (await clipResponse.json()) as {
        clips?: VideoClipDraft[];
        error?: string;
      };

      if (!generationResponse.ok) {
        throw new Error(generationPayload.error || "Unable to load gallery.");
      }

      if (!clipResponse.ok) {
        throw new Error(clipPayload.error || "Unable to load saved clips.");
      }

      setHistory(generationPayload.generations ?? []);
      setVideoClips(clipPayload.clips ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load gallery.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadHistory();
  }, []);

  const filteredHistory = useMemo(
    () =>
      history.filter((item) => {
        if (!showArchived && item.isArchived) return false;
        if (modeFilter !== "all" && item.mode !== modeFilter) return false;
        if (sceneFilter !== "all" && item.sceneTemplateId !== sceneFilter) return false;
        if (statusFilter !== "all" && item.status !== statusFilter) return false;
        if (favoritesOnly && !item.isFavorite) return false;
        if (approvedOnly && item.status !== "approved") return false;
        if (publishReadyOnly && !item.qualityTags.includes("publish-ready")) return false;
        return true;
      }),
    [approvedOnly, favoritesOnly, history, modeFilter, publishReadyOnly, sceneFilter, showArchived, statusFilter],
  );

  const summary = useMemo(
    () => ({
      total: history.length,
      visible: filteredHistory.length,
      approved: history.filter((item) => item.status === "approved").length,
      favorites: history.filter((item) => item.isFavorite).length,
      publishReady: history.filter((item) => item.qualityTags.includes("publish-ready")).length,
    }),
    [filteredHistory.length, history],
  );

  async function patchGeneration(id: string, payload: {
    isFavorite?: boolean;
    isArchived?: boolean;
    qualityTags?: QualityTag[];
  }) {
    const response = await fetch(`/api/generations/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Unable to update generation.");
    }
  }

  async function createDraft(id: string) {
    const response = await fetch(`/api/generations/${id}`, { method: "POST" });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Unable to create draft post.");
    }
  }

  async function deleteGeneration(id: string) {
    const response = await fetch(`/api/generations/${id}`, { method: "DELETE" });
    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(result.error || "Unable to delete generation.");
    }
  }

  async function runBatch(
    action: "favorite" | "unfavorite" | "archive" | "unarchive" | "delete" | "draft",
  ) {
    if (!selectedIds.length) {
      return;
    }

    setError(null);

    try {
      if (action === "favorite") {
        await Promise.all(selectedIds.map((id) => patchGeneration(id, { isFavorite: true })));
      } else if (action === "unfavorite") {
        await Promise.all(selectedIds.map((id) => patchGeneration(id, { isFavorite: false })));
      } else if (action === "archive") {
        await Promise.all(selectedIds.map((id) => patchGeneration(id, { isArchived: true })));
      } else if (action === "unarchive") {
        await Promise.all(selectedIds.map((id) => patchGeneration(id, { isArchived: false })));
      } else if (action === "draft") {
        await Promise.all(selectedIds.map((id) => createDraft(id)));
      } else {
        await Promise.all(selectedIds.map((id) => deleteGeneration(id)));
      }

      setSelectedIds([]);
      await loadHistory();
    } catch (batchError) {
      setError(batchError instanceof Error ? batchError.message : "Batch action failed.");
    }
  }

  function toggleSelection(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function activateApprovedFavoritesView() {
    setFavoritesOnly(true);
    setApprovedOnly(true);
    setPublishReadyOnly(true);
    setShowArchived(false);
    setStatusFilter("all");
  }

  return (
    <div>
      <Header
        title="Gallery"
        description="A simple asset browser for reviewing stills, clip drafts, and the images you want to turn into export packs."
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 shadow-panel">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Library browser</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">Find good assets quickly</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Use quick views first, then narrow by mode or scene only when you need to. The goal here is fast browsing, not heavy admin work.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={activateApprovedFavoritesView} className={batchButtonClassName}>
              Approved favorites
            </button>
            <button
              type="button"
              onClick={() => {
                setModeFilter("all");
                setSceneFilter("all");
                setStatusFilter("all");
                setFavoritesOnly(false);
                setApprovedOnly(false);
                setPublishReadyOnly(false);
                setShowArchived(false);
              }}
              className={batchButtonClassName}
            >
              Clear quick views
            </button>
            <Link href="/generate" className={batchButtonClassName}>
              Open Create
            </Link>
            <Link href="/posts" className={batchButtonClassName}>
              Open Exports
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Visible now</p>
            <p className="mt-2 text-3xl font-semibold text-white">{summary.visible}</p>
            <p className="mt-1 text-sm text-zinc-400">Items matching current filters</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-3">
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Approved</p>
              <p className="mt-2 text-2xl font-semibold text-white">{summary.approved}</p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Favorites</p>
              <p className="mt-2 text-2xl font-semibold text-white">{summary.favorites}</p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Ready</p>
              <p className="mt-2 text-2xl font-semibold text-white">{summary.publishReady}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-4 xl:grid-cols-7">
        <select value={modeFilter} onChange={(event) => setModeFilter(event.target.value as StyleMode | "all")} className={inputClassName}>
          <option value="all">All modes</option>
          <option value="lifestyle">Lifestyle</option>
          <option value="selfie">Selfie</option>
          <option value="sensual">Sensual</option>
        </select>
        <select value={sceneFilter} onChange={(event) => setSceneFilter(event.target.value)} className={inputClassName}>
          <option value="all">All scenes</option>
          {sceneLibrary.map((scene) => (
            <option key={scene.id} value={scene.id}>
              {scene.title}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as GenerationHistoryItem["status"] | "all")}
          className={inputClassName}
        >
          <option value="all">All statuses</option>
          <option value="completed">Completed</option>
          <option value="approved">Approved</option>
          <option value="failed">Failed</option>
        </select>
        <button type="button" onClick={() => setFavoritesOnly((value) => !value)} className={toggleClassName(favoritesOnly)}>
          Favorites only
        </button>
        <button type="button" onClick={() => setApprovedOnly((value) => !value)} className={toggleClassName(approvedOnly)}>
          Approved only
        </button>
        <button type="button" onClick={() => setPublishReadyOnly((value) => !value)} className={toggleClassName(publishReadyOnly)}>
          Publish-ready only
        </button>
        <button type="button" onClick={() => setShowArchived((value) => !value)} className={toggleClassName(showArchived)}>
          {showArchived ? "Hide archive" : "Show archive"}
        </button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
        <p className="text-sm text-zinc-400">{selectedIds.length} selected</p>
        <button type="button" onClick={() => void runBatch("favorite")} className={batchButtonClassName}>
          Favorite
        </button>
        <button type="button" onClick={() => void runBatch("unfavorite")} className={batchButtonClassName}>
          Unfavorite
        </button>
        <button type="button" onClick={() => void runBatch("archive")} className={batchButtonClassName}>
          Archive
        </button>
        <button type="button" onClick={() => void runBatch("unarchive")} className={batchButtonClassName}>
          Unarchive
        </button>
        <button type="button" onClick={() => void runBatch("draft")} className={batchButtonClassName}>
          Create drafts
        </button>
        <button type="button" onClick={() => void runBatch("delete")} className={dangerButtonClassName}>
          Delete
        </button>
      </div>

      {videoClips.length ? (
        <div className="mb-6 rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 shadow-panel">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-white">Saved clip drafts</h3>
              <p className="text-sm text-zinc-400">
                Vertical motion drafts saved from approved stills.
              </p>
            </div>
            <p className="text-sm text-zinc-500">{videoClips.length} clips</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {videoClips.slice(0, 3).map((clip) => {
              const generation = history.find((item) => item.id === clip.generationId);

              return (
                <div key={clip.id} className="overflow-hidden rounded-[1.3rem] border border-white/10 bg-black/10">
                  <div className="relative h-64">
                    <video
                      controls
                      playsInline
                      src={clip.videoUrl}
                      poster={clip.thumbnailUrl}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="space-y-2 p-4">
                    <p className="font-medium text-white">{generation?.characterName ?? "Persona clip"}</p>
                    <p className="text-sm text-zinc-400">{clip.motionLabel}</p>
                    <p className="text-xs text-zinc-500">
                      {clip.durationSeconds}s • {formatDate(clip.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {loading ? <LoadingState label="Loading gallery" /> : null}
      {error ? <p className="mb-4 text-sm text-rose-300">{error}</p> : null}

      {!loading && !filteredHistory.length ? (
        <EmptyState
          title="No gallery items"
          description="Adjust filters or generate more assets to fill the library."
        />
      ) : null}

      {!loading && filteredHistory.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-[1.4rem] border border-white/10 bg-white/[0.04]"
            >
              <div className="relative h-72 bg-white/5">
                {item.previewImageUrl ? (
                  <Image
                    src={item.previewImageUrl}
                    alt={item.characterName}
                    fill
                    className="object-cover"
                  />
                ) : null}
                <div className="absolute left-3 top-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => toggleSelection(item.id)}
                    className="h-4 w-4 accent-white"
                  />
                </div>
              </div>

              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{item.characterName}</p>
                    <p className="text-sm text-zinc-400">{item.sceneTitle}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                      {item.mode} • {item.shotType}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                <div className="space-y-1 text-xs text-zinc-500">
                  <p>{formatDate(item.createdAt)}</p>
                  <p>
                    {item.linkedPostId ? `Export pack: ${item.linkedPostStatus ?? "draft"}` : "Export pack: not created"}
                  </p>
                  {item.identityReview ? (
                    <p className={getIdentityLevelClassName(item.identityReview.level)}>
                      {item.identityReview.level} • {item.identityReview.confidence}% identity confidence
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  {item.imageRoles?.length ? (
                    item.imageRoles.map((role) => (
                      <span
                        key={role}
                        className="rounded-full border border-sky-300/15 bg-sky-300/[0.06] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-sky-100"
                      >
                        {role}
                      </span>
                    ))
                  ) : null}
                  {item.qualityTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => item.previewImageUrl && setPreviewImageUrl(item.previewImageUrl)}
                    className={batchButtonClassName}
                  >
                    View
                  </button>
                  <button type="button" onClick={() => void patchGeneration(item.id, { isFavorite: !item.isFavorite }).then(loadHistory)} className={batchButtonClassName}>
                    {item.isFavorite ? "Unfavorite" : "Favorite"}
                  </button>
                  <button type="button" onClick={() => void createDraft(item.id).then(loadHistory)} className={batchButtonClassName}>
                    Create draft
                  </button>
                  {item.linkedPostId ? (
                    <Link href={`/posts/${item.linkedPostId}`} className={batchButtonClassName}>
                      Open pack
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {previewImageUrl ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div
            className="relative h-[80vh] w-full max-w-4xl overflow-hidden rounded-[1.6rem] border border-white/10 bg-black"
            onClick={(event) => event.stopPropagation()}
          >
            <Image src={previewImageUrl} alt="Gallery preview" fill className="object-contain" />
          </div>
        </div>
      ) : null}
    </div>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none";

function toggleClassName(active: boolean) {
  return `rounded-2xl border px-4 py-3 text-sm transition ${
    active ? "border-white/30 bg-white/10 text-white" : "border-white/10 bg-black/10 text-zinc-400"
  }`;
}

const batchButtonClassName =
  "rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white transition hover:bg-white/[0.08]";

const dangerButtonClassName =
  "rounded-full border border-rose-300/20 bg-rose-300/10 px-3 py-1.5 text-xs text-rose-200 transition hover:bg-rose-300/15";

function getIdentityLevelClassName(level: "stable" | "review" | "high-risk") {
  if (level === "stable") {
    return "text-emerald-300";
  }

  if (level === "review") {
    return "text-amber-200";
  }

  return "text-rose-300";
}
