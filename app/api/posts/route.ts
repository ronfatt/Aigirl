import { NextResponse } from "next/server";
import { getDatabaseSnapshot } from "@/lib/db";

export async function GET() {
  try {
    const snapshot = await getDatabaseSnapshot();
    return NextResponse.json(snapshot);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load posts." },
      { status: 503 },
    );
  }
}
