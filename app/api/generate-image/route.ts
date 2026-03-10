import { NextResponse } from "next/server";
import { createGeneration } from "@/lib/db";
import { GenerateImageInput } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateImageInput;
    const result = await createGeneration(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to generate images." },
      { status: 400 },
    );
  }
}
