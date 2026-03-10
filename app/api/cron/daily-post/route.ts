import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Cron placeholder ready. Manual publishing is enabled in this MVP.",
  });
}
