import { NextResponse } from "next/server";
import { publishPost } from "@/lib/db";
import { PublishInput } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PublishInput;
    const result = await publishPost(body.postId, body.platform);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to publish post." },
      { status: 400 },
    );
  }
}
