import { NextResponse } from "next/server";
import { createGeneration } from "@/lib/db";
import { GenerateImageInput } from "@/lib/types";

function formatGenerateError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object") {
    const message =
      "message" in error ? String((error as { message?: string }).message ?? "") : "";
    const details =
      "details" in error ? String((error as { details?: string }).details ?? "") : "";
    const hint = "hint" in error ? String((error as { hint?: string }).hint ?? "") : "";

    return [message, details, hint].filter(Boolean).join(" | ") || "Unable to generate images.";
  }

  return typeof error === "string" ? error : "Unable to generate images.";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateImageInput;
    const result = await createGeneration(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: formatGenerateError(error) },
      { status: 400 },
    );
  }
}
