import { NextResponse } from "next/server";
import { testFacebookConnection } from "@/lib/meta-publisher";

export async function GET() {
  try {
    const result = await testFacebookConnection();
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        platform: "facebook",
        mode: "live",
        message: error instanceof Error ? error.message : "Unable to test Facebook connection.",
        details: {},
      },
      { status: 500 },
    );
  }
}
