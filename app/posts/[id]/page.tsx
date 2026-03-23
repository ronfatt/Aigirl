"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CaptionEditor } from "@/components/CaptionEditor";
import { Header } from "@/components/Header";
import { LoadingState } from "@/components/LoadingState";
import { Character, Generation, Post, VideoClipDraft } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function AssetPackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [postId, setPostId] = useState<string>("");
  const [data, setData] = useState<{
    post: Post;
    character: Character | null;
    generation: Generation | null;
    videoClips: VideoClipDraft[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const resolved = await params;
      if (!active) return;

      setPostId(resolved.id);

      try {
        const response = await fetch(`/api/posts/${resolved.id}`);
        const payload = (await response.json()) as {
          post?: Post;
          character?: Character | null;
          generation?: Generation | null;
          videoClips?: VideoClipDraft[];
          error?: string;
        };

        if (!response.ok || !payload.post) {
          throw new Error(payload.error || "Unable to load asset pack.");
        }

        if (active) {
          setData({
            post: payload.post,
            character: payload.character ?? null,
            generation: payload.generation ?? null,
            videoClips: payload.videoClips ?? [],
          });
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load asset pack.");
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [params]);

  return (
    <div>
      <Header
        title="Asset Pack"
        description="Review one export package with its still, clip drafts, and final caption in a single place."
      />

      {!data && !error ? <LoadingState label="Loading asset pack" /> : null}
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      {data ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/posts"
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white transition hover:bg-white/[0.08]"
            >
              Back to Exports
            </Link>
            <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Asset ID: {postId}
            </span>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-4 shadow-panel">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.2rem] bg-white/5">
                  {data.generation?.selectedImageUrl ? (
                    <Image
                      src={data.generation.selectedImageUrl}
                      alt={data.character?.displayName ?? "Asset still"}
                      fill
                      className="object-cover"
                    />
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {data.generation?.selectedImageUrl ? (
                    <a
                      href={data.generation.selectedImageUrl}
                      download={`${data.character?.displayName ?? "persona"}-${data.generation.id}.jpg`}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white transition hover:bg-white/[0.08]"
                    >
                      Download image
                    </a>
                  ) : null}
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 shadow-panel">
                <h3 className="text-lg font-semibold text-white">Pack details</h3>
                <div className="mt-4 grid gap-3 text-sm text-zinc-400">
                  <p>Persona: {data.character?.displayName ?? "Unknown"}</p>
                  <p>Caption style: {data.post.platform}</p>
                  <p>Status: {data.post.status}</p>
                  <p>Updated: {formatDate(data.post.updatedAt)}</p>
                  <p>Shot type: {data.generation?.shotType ?? "Unknown"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 shadow-panel">
                <h3 className="text-lg font-semibold text-white">Caption</h3>
                <p className="mt-1 text-sm text-zinc-400">
                  Tune the final caption and copy it for manual posting.
                </p>
                <div className="mt-4">
                  <CaptionEditor post={data.post} />
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 shadow-panel">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Clip drafts</h3>
                    <p className="mt-1 text-sm text-zinc-400">
                      Saved vertical clips linked to this still.
                    </p>
                  </div>
                  <p className="text-sm text-zinc-500">{data.videoClips.length} clips</p>
                </div>

                {data.videoClips.length ? (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {data.videoClips.map((clip) => (
                      <div
                        key={clip.id}
                        className="overflow-hidden rounded-[1.2rem] border border-white/10 bg-black/10"
                      >
                        <video
                          controls
                          playsInline
                          poster={clip.thumbnailUrl}
                          src={clip.videoUrl}
                          className="aspect-[9/16] w-full bg-black object-cover"
                        />
                        <div className="space-y-2 p-4">
                          <p className="font-medium text-white">{clip.motionLabel}</p>
                          <p className="text-xs text-zinc-500">
                            {clip.durationSeconds}s • {formatDate(clip.createdAt)}
                          </p>
                          <a
                            href={clip.videoUrl}
                            download={`${data.character?.displayName ?? "persona"}-${clip.id}.webm`}
                            className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white transition hover:bg-white/[0.08]"
                          >
                            Download clip
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-[1.2rem] border border-dashed border-white/10 bg-black/10 p-4 text-sm text-zinc-500">
                    No saved clips yet for this asset pack.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
