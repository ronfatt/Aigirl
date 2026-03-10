import { NextResponse } from "next/server";
import { updatePost } from "@/lib/db";
import { Platform, PostStatus } from "@/lib/types";

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
