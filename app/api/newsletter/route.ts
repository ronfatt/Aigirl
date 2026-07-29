import { NextResponse } from "next/server";
import { z } from "zod";
const schema = z.object({ email: z.string().email(), website: z.string().max(0) });
export async function POST(request: Request) { const parsed = schema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 }); return NextResponse.json({ ok: true, mode: "mock" }); }
