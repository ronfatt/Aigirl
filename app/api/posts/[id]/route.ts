import { NextResponse } from "next/server";
import { getDatabaseSnapshot, updatePost } from "@/lib/db";
import { Platform, PostStatus } from "@/lib/types";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const snapshot = await getDatabaseSnapshot();
    const post = snapshot.posts.find((item) => item.id === id) ?? null;

    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    const character = snapshot.characters.find((item) => item.id === post.characterId) ?? null;
    const generation = snapshot.generations.find((item) => item.id === post.generationId) ?? null;
    const videoClips = snapshot.videoClips.filter((item) => item.generationId === post.generationId);

    return NextResponse.json({
      post,
      character,
      generation,
      videoClips,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load asset pack." },
      { status: 400 },
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      caption?: string;
      platform?: Platform;
      status?: PostStatus;
      scheduledAt?: string | null;
    };

    const post = await updatePost(id, body);

    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update post." },
      { status: 400 },
    );
  }
}
