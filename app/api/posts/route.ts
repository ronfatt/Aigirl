import { NextResponse } from "next/server";
import { listPosts } from "@/lib/db";

export async function GET() {
  const posts = await listPosts();
  return NextResponse.json({ posts });
}
