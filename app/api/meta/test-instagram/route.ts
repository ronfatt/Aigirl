import { NextResponse } from "next/server";
import { testInstagramConnection } from "@/lib/meta-publisher";

export async function GET() {
  try {
    const result = await testInstagramConnection();
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        platform: "instagram",
        mode: "live",
        message: error instanceof Error ? error.message : "Unable to test Instagram connection.",
        details: {},
      },
      { status: 500 },
    );
  }
}
