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
  const [publishReadyOnly, setPublishReadyOnly] = useState(false);

  const filteredPosts = useMemo(
    () =>
      posts.filter((post) => {
        if (platformFilter !== "all" && post.platform !== platformFilter) return false;
        if (statusFilter !== "all" && post.status !== statusFilter) return false;
        if (publishReadyOnly) {
          const generation = generations.find((item) => item.id === post.generationId);
          if (!generation?.qualityTags.includes("publish-ready")) {
            return false;
          }
        }
        return true;
      }),
    [generations, platformFilter, posts, publishReadyOnly, statusFilter],
  );

  if (!posts.length) {
    return (
      <EmptyState
        title="No export drafts yet"
        description="Approved generations will appear here once you create an asset draft."
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
          <option value="all">All caption styles</option>
          <option value="instagram">Instagram short</option>
          <option value="facebook">Facebook long</option>
          <option value="both">Both-ready</option>
        </select>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as PostStatus | "all")}
          className={inputClassName}
        >
          <option value="all">All asset states</option>
          <option value="draft">Draft</option>
          <option value="queued">Queued</option>
          <option value="published">Completed</option>
          <option value="failed">Needs review</option>
        </select>
        <button
          type="button"
          onClick={() => setPublishReadyOnly((value) => !value)}
          className={toggleClassName(publishReadyOnly)}
        >
          Export-ready only
        </button>
      </div>

      {!filteredPosts.length ? (
        <EmptyState
          title="No matching export drafts"
          description="Adjust the filters to show a different slice of your asset library."
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
              {generation?.selectedImageUrl ? (
                <a
                  href={generation.selectedImageUrl}
                  download={`${character?.displayName ?? "persona"}-${generation.id}.jpg`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white transition hover:bg-white/[0.08]"
                >
                  Download image
                </a>
              ) : null}
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {character?.displayName ?? "Unknown persona"}
                  </h3>
                  <p className="text-sm text-zinc-400">
                    {post.platform} caption style • Created {formatDate(post.createdAt)}
                  </p>
                </div>
                <StatusBadge status={post.status} />
              </div>

              <div className="grid gap-3 text-sm text-zinc-400 md:grid-cols-4">
                <p>Updated: {formatDate(post.updatedAt)}</p>
                <p>Export slot: {post.status}</p>
                <p>Asset ID: {post.id}</p>
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

function toggleClassName(active: boolean) {
  return `rounded-2xl border px-4 py-3 text-sm transition ${
    active ? "border-white/30 bg-white/10 text-white" : "border-white/10 bg-black/10 text-zinc-400"
  }`;
}
