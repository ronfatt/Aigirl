"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CaptionEditor } from "@/components/CaptionEditor";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { Character, Generation, Platform, Post, PostStatus, VideoClipDraft } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface PostTableProps {
  posts: Post[];
  characters: Character[];
  generations: Generation[];
  videoClips: VideoClipDraft[];
}

export function PostTable({ posts, characters, generations, videoClips }: PostTableProps) {
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

  if (!posts.length && !videoClips.length) {
    return (
      <EmptyState
        title="No export drafts yet"
        description="Approved generations will appear here once you create an asset draft."
      />
    );
  }

  return (
    <div className="space-y-4">
      {videoClips.length ? (
        <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 shadow-panel">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-white">Saved video clips</h3>
              <p className="text-sm text-zinc-400">
                Rendered clip drafts saved for manual posting and download.
              </p>
            </div>
            <p className="text-sm text-zinc-500">{videoClips.length} clips</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {videoClips.slice(0, 6).map((clip) => {
              const character = characters.find((item) => item.id === clip.characterId);
              const generation = generations.find((item) => item.id === clip.generationId);

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
                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{character?.displayName ?? "Persona"}</p>
                        <p className="text-sm text-zinc-400">{clip.motionLabel}</p>
                      </div>
                      <StatusBadge status={generation?.status ?? "completed"} />
                    </div>
                    <p className="text-xs text-zinc-500">
                      {clip.durationSeconds}s • {formatDate(clip.createdAt)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={clip.videoUrl}
                        download={`${character?.displayName ?? "persona"}-${clip.id}.webm`}
                        className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white transition hover:bg-white/[0.08]"
                      >
                        Download clip
                      </a>
                      <a
                        href={clip.sourceImageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white transition hover:bg-white/[0.08]"
                      >
                        View source
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

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
        const relatedClips = videoClips.filter((clip) => clip.generationId === post.generationId);

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
                    Export pack • {post.platform} caption style • Created {formatDate(post.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/posts/${post.id}`}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white transition hover:bg-white/[0.08]"
                  >
                    Open pack
                  </Link>
                  <StatusBadge status={post.status} />
                </div>
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

              {relatedClips.length ? (
                <div className="rounded-[1.2rem] border border-white/10 bg-black/10 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-medium text-white">Related clip drafts</h4>
                      <p className="text-xs text-zinc-500">
                        Saved vertical clips built from this same approved still.
                      </p>
                    </div>
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                      {relatedClips.length} clips
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {relatedClips.slice(0, 2).map((clip) => (
                      <div key={clip.id} className="overflow-hidden rounded-[1rem] border border-white/10 bg-white/[0.03]">
                        <video
                          controls
                          playsInline
                          poster={clip.thumbnailUrl}
                          src={clip.videoUrl}
                          className="aspect-[9/16] w-full bg-black object-cover"
                        />
                        <div className="space-y-2 p-3">
                          <p className="text-sm font-medium text-white">{clip.motionLabel}</p>
                          <p className="text-xs text-zinc-500">
                            {clip.durationSeconds}s • {formatDate(clip.createdAt)}
                          </p>
                          <a
                            href={clip.videoUrl}
                            download={`${character?.displayName ?? "persona"}-${clip.id}.webm`}
                            className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white transition hover:bg-white/[0.08]"
                          >
                            Download clip
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-[1.2rem] border border-dashed border-white/10 bg-black/10 p-4 text-sm text-zinc-500">
                  No clip draft saved for this export yet.
                </div>
              )}

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
