import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
const storageBucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || "persona-assets";
const storageEnabled = Boolean(supabaseUrl && supabaseServiceRoleKey);

let supabaseAdmin: ReturnType<typeof createClient> | null = null;

function getSupabaseStorageClient() {
  if (!storageEnabled) {
    throw new Error("Supabase Storage is not configured.");
  }

  if (!supabaseAdmin) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseAdmin;
}

export async function storeGeneratedImage(input: { url: string; filename: string }) {
  if (!storageEnabled) {
    return {
      url: input.url,
      provider: "mock",
    };
  }

  try {
    const response = await fetch(input.url, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Unable to download image (${response.status}).`);
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();
    const filePath = `generated/${new Date().toISOString().slice(0, 10)}/${input.filename}`;
    const client = getSupabaseStorageClient();

    // Production hardening still needed:
    // - validate MIME type and file size before upload
    // - add retry/backoff for transient download and upload errors
    // - use signed URLs instead of public URLs if assets should stay private
    const upload = await client.storage.from(storageBucket).upload(filePath, arrayBuffer, {
      contentType,
      upsert: true,
    });

    if (upload.error) {
      throw upload.error;
    }

    const { data } = client.storage.from(storageBucket).getPublicUrl(filePath);

    if (!data.publicUrl) {
      throw new Error("Supabase Storage did not return a public URL.");
    }

    return {
      url: data.publicUrl,
      provider: "supabase-storage",
    };
  } catch (error) {
    console.error("Supabase Storage upload failed, falling back to source URL.", error);

    return {
      url: input.url,
      provider: "mock",
    };
  }
}
