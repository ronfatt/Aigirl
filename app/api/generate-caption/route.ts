import { NextResponse } from "next/server";
import { createCaption } from "@/lib/db";
import { CaptionInput } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CaptionInput;
    const caption = await createCaption(body);
    return NextResponse.json(caption);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to generate caption." },
      { status: 400 },
    );
  }
}
