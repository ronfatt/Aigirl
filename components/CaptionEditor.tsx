"use client";

import { useState, useTransition } from "react";
import { Platform, Post } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CaptionEditorProps {
  post: Post;
}

const platforms: Platform[] = ["facebook", "instagram", "both"];

export function CaptionEditor({ post }: CaptionEditorProps) {
  const [caption, setCaption] = useState(post.caption);
  const [platform, setPlatform] = useState<Platform>(post.platform);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function saveDraft() {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/posts/${post.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ caption, platform }),
        });

        if (!response.ok) {
          throw new Error("Unable to save post.");
        }

        setMessage("Draft updated.");
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : "Unable to save.");
      }
    });
  }

  async function publishNow() {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/publish", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ postId: post.id, platform }),
        });

        if (!response.ok) {
          throw new Error("Publish failed.");
        }

        setMessage("Publish request completed.");
      } catch (publishError) {
        setError(publishError instanceof Error ? publishError.message : "Publish failed.");
      }
    });
  }

  return (
    <div className="space-y-4 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
      <div className="flex flex-wrap gap-2">
        {platforms.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setPlatform(item)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm capitalize transition",
              platform === item ? "bg-white text-black" : "bg-white/5 text-zinc-400",
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <textarea
        value={caption}
        onChange={(event) => setCaption(event.target.value)}
        rows={4}
        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white/20"
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={saveDraft}
          className={cn(
            "rounded-2xl border border-white/10 px-4 py-2.5 text-sm text-white transition hover:bg-white/5",
            isPending && "cursor-not-allowed opacity-60",
          )}
        >
          Save Draft
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={publishNow}
          className={cn(
            "rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-black transition",
            isPending && "cursor-not-allowed opacity-60",
          )}
        >
          Publish Now
        </button>
        {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      </div>
    </div>
  );
}
