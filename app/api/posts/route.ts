import { NextResponse } from "next/server";
import { getDatabaseSnapshot } from "@/lib/db";

export async function GET() {
  const snapshot = await getDatabaseSnapshot();
  return NextResponse.json(snapshot);
}
