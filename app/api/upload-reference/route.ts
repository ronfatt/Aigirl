import { NextResponse } from "next/server";
import { storeReferenceImage } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image uploads are allowed." }, { status: 400 });
    }

    const result = await storeReferenceImage({
      bytes: await file.arrayBuffer(),
      filename: file.name || "reference.jpg",
      contentType: file.type,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to upload reference image." },
      { status: 400 },
    );
  }
}
