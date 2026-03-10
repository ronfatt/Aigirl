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

async function resolveStoredAssetUrl(filePath: string) {
  const client = getSupabaseStorageClient();
  const { data } = client.storage.from(storageBucket).getPublicUrl(filePath);
  const publicUrl = data.publicUrl;

  if (publicUrl) {
    try {
      const response = await fetch(publicUrl, {
        method: "HEAD",
        cache: "no-store",
      });

      if (response.ok) {
        return publicUrl;
      }
    } catch {
      // Fall back to a signed URL when the public URL is not reachable.
    }
  }

  // Signed URLs help preview private buckets, but production publishing flows
  // still work best when the bucket is public because Meta must fetch the asset.
  const signed = await client.storage.from(storageBucket).createSignedUrl(filePath, 60 * 60 * 24 * 30);

  if (signed.error || !signed.data.signedUrl) {
    throw signed.error || new Error("Supabase Storage did not return an accessible URL.");
  }

  return signed.data.signedUrl;
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

    return {
      url: await resolveStoredAssetUrl(filePath),
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

export async function storeReferenceImage(input: {
  bytes: ArrayBuffer;
  filename: string;
  contentType?: string;
}) {
  if (!storageEnabled) {
    throw new Error("Supabase Storage is not configured.");
  }

  const client = getSupabaseStorageClient();
  const extension = input.filename.includes(".") ? "" : ".jpg";
  const safeName = input.filename.replace(/[^a-zA-Z0-9._-]/g, "-");
  const filePath = `references/${new Date().toISOString().slice(0, 10)}/${safeName}${extension}`;

  // Production hardening still needed:
  // - enforce stricter file size limits and MIME allowlist
  // - run image sanitization / resizing before upload
  // - use auth checks so only authorized users can upload references
  const upload = await client.storage.from(storageBucket).upload(filePath, input.bytes, {
    contentType: input.contentType || "image/jpeg",
    upsert: true,
  });

  if (upload.error) {
    throw upload.error;
  }

  return {
    url: await resolveStoredAssetUrl(filePath),
    provider: "supabase-storage" as const,
  };
}
