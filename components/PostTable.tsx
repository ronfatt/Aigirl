"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { CaptionEditor } from "@/components/CaptionEditor";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { Character, Generation, Platform, Post, PostStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface PostTableProps {
  posts: Post[];
  characters: Character[];
  generations: Generation[];
}

export function PostTable({ posts, characters, generations }: PostTableProps) {
  const [platformFilter, setPlatformFilter] = useState<Platform | "all">("all");
  const [statusFilter, setStatusFilter] = useState<PostStatus | "all">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const filteredPosts = useMemo(
    () =>
      posts.filter((post) => {
        if (platformFilter !== "all" && post.platform !== platformFilter) return false;
        if (statusFilter !== "all" && post.status !== statusFilter) return false;
        return true;
      }),
    [platformFilter, posts, statusFilter],
  );

  function toggleSelection(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  async function runBatchPublish(platform: Platform) {
    if (!selectedIds.length) {
      return;
    }

    setError(null);
    setMessage(null);

    try {
      await Promise.all(
        selectedIds.map(async (postId) => {
          const response = await fetch("/api/publish", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ postId, platform }),
          });

          const payload = await response.json();

          if (!response.ok) {
            throw new Error(payload.error || "Batch publish failed.");
          }
        }),
      );

      setMessage(`Batch publish completed for ${selectedIds.length} posts.`);
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : "Batch publish failed.");
    }
  }

  if (!posts.length) {
    return (
      <EmptyState
        title="No posts yet"
        description="Generated content will appear here once you create a draft post."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
        <select
          value={platformFilter}
          onChange={(event) => setPlatformFilter(event.target.value as Platform | "all")}
          className={inputClassName}
        >
          <option value="all">All platforms</option>
          <option value="instagram">Instagram</option>
          <option value="facebook">Facebook</option>
          <option value="both">Both</option>
        </select>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as PostStatus | "all")}
          className={inputClassName}
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="queued">Queued</option>
          <option value="published">Published</option>
          <option value="failed">Failed</option>
        </select>

        <p className="text-sm text-zinc-400">{selectedIds.length} selected</p>

        <button type="button" onClick={() => void runBatchPublish("instagram")} className={batchButtonClassName}>
          Batch publish IG
        </button>
        <button type="button" onClick={() => void runBatchPublish("facebook")} className={batchButtonClassName}>
          Batch publish FB
        </button>
        <button type="button" onClick={() => void runBatchPublish("both")} className={batchButtonClassName}>
          Batch publish both
        </button>

        {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      </div>

      {!filteredPosts.length ? (
        <EmptyState
          title="No matching posts"
          description="Adjust the filters to show a different slice of your post queue."
        />
      ) : null}

      {filteredPosts.map((post) => {
        const character = characters.find((item) => item.id === post.characterId);
        const generation = generations.find((item) => item.id === post.generationId);

        return (
          <div
            key={post.id}
            className="grid gap-5 rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 shadow-panel lg:grid-cols-[220px,1fr]"
          >
            <div className="space-y-3">
              <div className="relative h-72 overflow-hidden rounded-[1.2rem]">
                {generation?.selectedImageUrl ? (
                  <Image
                    src={generation.selectedImageUrl}
                    alt={character?.displayName ?? "Post image"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-white/5 text-sm text-zinc-500">
                    No preview
                  </div>
                )}
              </div>

              <label className="flex items-center gap-2 text-sm text-zinc-400">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(post.id)}
                  onChange={() => toggleSelection(post.id)}
                  className="h-4 w-4 accent-white"
                />
                Select for batch
              </label>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {character?.displayName ?? "Unknown persona"}
                  </h3>
                  <p className="text-sm text-zinc-400">
                    {post.platform} • Created {formatDate(post.createdAt)}
                  </p>
                </div>
                <StatusBadge status={post.status} />
              </div>

              <div className="grid gap-3 text-sm text-zinc-400 md:grid-cols-4">
                <p>Published: {formatDate(post.publishedAt)}</p>
                <p>Scheduled: {formatDate(post.scheduledAt)}</p>
                <p>External ID: {post.externalPostId ?? "Pending"}</p>
                <p>Shot: {generation?.shotType ?? "Unknown"}</p>
              </div>

              {generation?.qualityTags.length ? (
                <div className="flex flex-wrap gap-2">
                  {generation.qualityTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              {post.publishError ? (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  Publish error: {post.publishError}
                </div>
              ) : null}

              <CaptionEditor post={post} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

const inputClassName =
  "rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none";

const batchButtonClassName =
  "rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white transition hover:bg-white/[0.08]";
