import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/db";

export async function GET() {
  try {
    const dashboard = await getDashboardData();
    return NextResponse.json(dashboard);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load dashboard." },
      { status: 503 },
    );
  }
}
