const blobEnabled = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

export async function storeGeneratedImage(input: { url: string; filename: string }) {
  if (!blobEnabled) {
    return {
      url: input.url,
      provider: "mock",
    };
  }

  // Hook point for @vercel/blob put() once real image bytes are available.
  return {
    url: input.url,
    provider: "vercel-blob",
  };
}
