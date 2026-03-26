import { NextResponse } from "next/server";
import { deleteCharacter, updateCharacter } from "@/lib/db";
import { CharacterInput } from "@/lib/types";

function formatCharacterError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object") {
    const message =
      "message" in error ? String((error as { message?: string }).message ?? "") : "";
    const details =
      "details" in error ? String((error as { details?: string }).details ?? "") : "";
    const hint = "hint" in error ? String((error as { hint?: string }).hint ?? "") : "";

    return [message, details, hint].filter(Boolean).join(" | ") || "Unable to update character.";
  }

  return typeof error === "string" ? error : "Unable to update character.";
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as Partial<CharacterInput>;
    const character = await updateCharacter(id, body);

    if (!character) {
      return NextResponse.json({ error: "Character not found." }, { status: 404 });
    }

    return NextResponse.json({ character });
  } catch (error) {
    return NextResponse.json(
      { error: formatCharacterError(error) },
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
    const deleted = await deleteCharacter(id);

    if (!deleted) {
      return NextResponse.json({ error: "Character not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: formatCharacterError(error).replace("update", "delete") },
      { status: 400 },
    );
  }
}
