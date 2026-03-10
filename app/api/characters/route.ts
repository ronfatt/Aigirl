import { NextResponse } from "next/server";
import { createCharacter, listCharacters } from "@/lib/db";
import { CharacterInput } from "@/lib/types";

export async function GET() {
  try {
    const characters = await listCharacters();
    return NextResponse.json({ characters });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load characters." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CharacterInput;
    const character = await createCharacter(body);
    return NextResponse.json({ character }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create character." },
      { status: 400 },
    );
  }
}
