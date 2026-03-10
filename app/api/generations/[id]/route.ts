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

    const generation = await selectGenerationImage(id, body.selectedImageUrl);

    if (!generation) {
      return NextResponse.json({ error: "Generation not found." }, { status: 404 });
    }

    return NextResponse.json({ generation });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update generation." },
      { status: 400 },
    );
  }
}
