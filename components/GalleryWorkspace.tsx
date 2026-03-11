"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { Header } from "@/components/Header";
import { LoadingState } from "@/components/LoadingState";
import { StatusBadge } from "@/components/StatusBadge";
import { sceneLibrary } from "@/lib/scene-library";
import { GenerationHistoryItem, QualityTag, StyleMode } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function GalleryWorkspace() {
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [modeFilter, setModeFilter] = useState<StyleMode | "all">("all");
  const [sceneFilter, setSceneFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<GenerationHistoryItem["status"] | "all">("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [approvedOnly, setApprovedOnly] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  async function loadHistory() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generations");
      const payload = (await response.json()) as {
        generations?: GenerationHistoryItem[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to load gallery.");
      }

      setHistory(payload.generations ?? []);
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
        return true;
      }),
    [approvedOnly, favoritesOnly, history, modeFilter, sceneFilter, showArchived, statusFilter],
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

  async function runBatch(action: "favorite" | "archive" | "delete" | "draft") {
    if (!selectedIds.length) {
      return;
    }

    setError(null);

    try {
      if (action === "favorite") {
        await Promise.all(selectedIds.map((id) => patchGeneration(id, { isFavorite: true })));
      } else if (action === "archive") {
        await Promise.all(selectedIds.map((id) => patchGeneration(id, { isArchived: true })));
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

  return (
    <div>
      <Header
        title="Gallery"
        description="Browse all generated assets, batch-manage your library, and recover approved visuals faster."
      />

      <div className="mb-6 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
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
        <button type="button" onClick={() => setShowArchived((value) => !value)} className={toggleClassName(showArchived)}>
          {showArchived ? "Hide archive" : "Show archive"}
        </button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
        <p className="text-sm text-zinc-400">{selectedIds.length} selected</p>
        <button type="button" onClick={() => void runBatch("favorite")} className={batchButtonClassName}>
          Favorite
        </button>
        <button type="button" onClick={() => void runBatch("archive")} className={batchButtonClassName}>
          Archive
        </button>
        <button type="button" onClick={() => void runBatch("draft")} className={batchButtonClassName}>
          Create drafts
        </button>
        <button type="button" onClick={() => void runBatch("delete")} className={dangerButtonClassName}>
          Delete
        </button>
      </div>

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

                <p className="text-xs text-zinc-500">{formatDate(item.createdAt)}</p>

                <div className="flex flex-wrap gap-2">
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
                    Draft
                  </button>
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
