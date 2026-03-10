import Image from "next/image";
import { Character, Generation, Post } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { CaptionEditor } from "@/components/CaptionEditor";
import { EmptyState } from "@/components/EmptyState";
import { formatDate } from "@/lib/utils";

interface PostTableProps {
  posts: Post[];
  characters: Character[];
  generations: Generation[];
}

export function PostTable({ posts, characters, generations }: PostTableProps) {
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
      {posts.map((post) => {
        const character = characters.find((item) => item.id === post.characterId);
        const generation = generations.find((item) => item.id === post.generationId);

        return (
          <div
            key={post.id}
            className="grid gap-5 rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 shadow-panel lg:grid-cols-[220px,1fr]"
          >
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

              <div className="grid gap-3 text-sm text-zinc-400 md:grid-cols-3">
                <p>Published: {formatDate(post.publishedAt)}</p>
                <p>Scheduled: {formatDate(post.scheduledAt)}</p>
                <p>External ID: {post.externalPostId ?? "Pending"}</p>
              </div>

              <CaptionEditor post={post} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
