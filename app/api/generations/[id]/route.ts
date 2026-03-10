import { NextResponse } from "next/server";
import { selectGenerationImage } from "@/lib/db";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as { selectedImageUrl?: string };

    if (!body.selectedImageUrl) {
      return NextResponse.json({ error: "selectedImageUrl is required." }, { status: 400 });
    }

    const result = await selectGenerationImage(id, body.selectedImageUrl);

    if (!result) {
      return NextResponse.json({ error: "Generation not found." }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update generation." },
      { status: 400 },
    );
  }
}
