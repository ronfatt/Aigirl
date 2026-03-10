import { NextResponse } from "next/server";
import { updateCharacter } from "@/lib/db";
import { CharacterInput } from "@/lib/types";

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
      { error: error instanceof Error ? error.message : "Unable to update character." },
      { status: 400 },
    );
  }
}
