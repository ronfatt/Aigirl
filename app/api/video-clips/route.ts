import { NextResponse } from "next/server";
import { createVideoClipDraft, listVideoClips } from "@/lib/db";
import { storeGeneratedVideo } from "@/lib/storage";
import { makeId } from "@/lib/utils";

export async function GET() {
  try {
    const clips = await listVideoClips();
    return NextResponse.json({ clips });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load video clips." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const generationId = String(formData.get("generationId") ?? "");
    const sourceImageUrl = String(formData.get("sourceImageUrl") ?? "");
    const motionPresetId = String(formData.get("motionPresetId") ?? "");
    const motionLabel = String(formData.get("motionLabel") ?? "");
    const motionPrompt = String(formData.get("motionPrompt") ?? "");
    const durationSeconds = Number(formData.get("durationSeconds") ?? 0);
    const file = formData.get("file");

    if (!generationId || !sourceImageUrl || !motionPresetId || !motionLabel || !motionPrompt || !durationSeconds) {
      return NextResponse.json({ error: "Missing clip metadata." }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Clip file is required." }, { status: 400 });
    }

    const uploaded = await storeGeneratedVideo({
      bytes: await file.arrayBuffer(),
      filename: `${generationId}-${makeId("clip")}.webm`,
      contentType: file.type || "video/webm",
    });

    const clip = await createVideoClipDraft({
      generationId,
      sourceImageUrl,
      videoUrl: uploaded.url,
      motionPresetId,
      motionLabel,
      motionPrompt,
      durationSeconds,
    });

    return NextResponse.json({ clip });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save video clip." },
      { status: 400 },
    );
  }
}
