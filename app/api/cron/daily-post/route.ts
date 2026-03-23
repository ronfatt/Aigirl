import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Cron placeholder ready. This studio currently focuses on manual asset creation and export.",
  });
}
