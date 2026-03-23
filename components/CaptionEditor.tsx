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
  const [options, setOptions] = useState(post.captionOptions);
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

  async function copyCaption() {
    setError(null);
    setMessage(null);

    try {
      await navigator.clipboard.writeText(caption);
      setMessage("Caption copied.");
    } catch (copyError) {
      setError(copyError instanceof Error ? copyError.message : "Unable to copy caption.");
    }
  }

  async function refreshCaption() {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/generate-caption", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            characterId: post.characterId,
            generationId: post.generationId,
            platform,
          }),
        });

        const payload = (await response.json()) as {
          options?: string[];
          error?: string;
        };

        if (!response.ok || !payload.options?.length) {
          throw new Error(payload.error || "Unable to refresh caption.");
        }

        setOptions(payload.options);
        setCaption(payload.options[0] ?? caption);
        setMessage(
          platform === "facebook"
            ? "Facebook-style caption refreshed."
            : "Instagram-style caption refreshed.",
        );
      } catch (refreshError) {
        setError(refreshError instanceof Error ? refreshError.message : "Unable to refresh caption.");
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

      {options.length ? (
        <div className="grid gap-2">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setCaption(option)}
              className={cn(
                "rounded-2xl border px-4 py-3 text-left text-sm transition",
                caption === option
                  ? "border-white bg-white text-black"
                  : "border-white/10 bg-black/10 text-zinc-200 hover:border-white/20 hover:bg-white/5",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={refreshCaption}
          className={cn(
            "rounded-2xl border border-white/10 px-4 py-2.5 text-sm text-white transition hover:bg-white/5",
            isPending && "cursor-not-allowed opacity-60",
          )}
        >
          Refresh for platform
        </button>
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
          onClick={copyCaption}
          className={cn(
            "rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-black transition",
            isPending && "cursor-not-allowed opacity-60",
          )}
        >
          Copy Caption
        </button>
        {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      </div>
    </div>
  );
}
