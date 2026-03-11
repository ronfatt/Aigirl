import { NextResponse } from "next/server";
import { createDraftPostForGeneration, deleteGeneration, selectGenerationImage, updateGenerationMeta } from "@/lib/db";
import { QualityTag } from "@/lib/types";

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

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      isFavorite?: boolean;
      isArchived?: boolean;
      qualityTags?: QualityTag[];
    };

    const generation = await updateGenerationMeta(id, body);

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

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const result = await createDraftPostForGeneration(id);

    if (!result) {
      return NextResponse.json({ error: "Generation not found." }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create draft post." },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const ok = await deleteGeneration(id);
    return NextResponse.json({ ok });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete generation." },
      { status: 400 },
    );
  }
}
