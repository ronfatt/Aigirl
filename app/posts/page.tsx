"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { LoadingState } from "@/components/LoadingState";
import { PostTable } from "@/components/PostTable";
import { Character, Generation, Post } from "@/lib/types";

export default function PostsPage() {
  const [snapshot, setSnapshot] = useState<{
    posts: Post[];
    characters: Character[];
    generations: Generation[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadPosts() {
      try {
        const response = await fetch("/api/posts");

        if (!response.ok) {
          throw new Error("Unable to load posts.");
        }

        const payload = (await response.json()) as {
          posts: Post[];
          characters: Character[];
          generations: Generation[];
        };

        if (active) {
          setSnapshot(payload);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load posts.");
        }
      }
    }

    void loadPosts();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <Header
        title="Exports"
        description="Review image assets, tune platform-specific captions, and prepare manual Instagram-ready download packages."
      />
      {!snapshot && !error ? <LoadingState label="Loading posts" /> : null}
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      {snapshot ? (
        <PostTable
          posts={snapshot.posts}
          characters={snapshot.characters}
          generations={snapshot.generations}
        />
      ) : null}
    </div>
  );
}
