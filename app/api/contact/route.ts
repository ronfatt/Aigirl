import { NextResponse } from "next/server";
import { z } from "zod";
const schema=z.object({name:z.string().min(2),email:z.string().email(),country:z.string().min(2),company:z.string().optional(),interest:z.string().optional(),enquiryType:z.string().optional(),message:z.string().min(10),lookId:z.string().optional(),consent:z.literal(true),website:z.string().max(0)});
export async function POST(request:Request){const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({ok:false,issues:parsed.error.flatten()},{status:400});return NextResponse.json({ok:true,mode:"mock"});}
