import { Platform, PublishPlatformResult, PublishResult } from "@/lib/types";

const META_GRAPH_BASE_URL = "https://graph.facebook.com/v23.0";

function getMetaConfig() {
  return {
    accessToken: process.env.META_ACCESS_TOKEN?.trim() || "",
    igBusinessId: process.env.META_IG_BUSINESS_ID?.trim() || "",
    fbPageId: process.env.META_FB_PAGE_ID?.trim() || "",
  };
}

function canPublishToInstagram() {
  const config = getMetaConfig();
  return Boolean(config.accessToken && config.igBusinessId);
}

function canPublishToFacebook() {
  const config = getMetaConfig();
  return Boolean(config.accessToken && config.fbPageId);
}

async function metaFormPost(path: string, params: Record<string, string>) {
  const body = new URLSearchParams(params);
  const response = await fetch(`${META_GRAPH_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Meta Graph API request failed (${response.status}): ${text || response.statusText}`);
  }

  return response.json() as Promise<Record<string, unknown>>;
}

async function publishMock(
  platform: Exclude<Platform, "both">,
): Promise<PublishPlatformResult> {
  return {
    ok: false,
    platform,
    externalPostId: null,
    error:
      "Mock publishing mode. Meta credentials are missing or incomplete, so no live post was sent.",
  };
}

export async function publishToInstagram(
  imageUrl: string,
  caption: string,
): Promise<PublishPlatformResult> {
  if (!canPublishToInstagram()) {
    return publishMock("instagram");
  }

  const { accessToken, igBusinessId } = getMetaConfig();

  try {
    // Production hardening still needed:
    // - validate the image URL is a direct, stable JPEG/PNG asset
    // - poll container status before publish for large media
    // - add rate-limit backoff and structured request logging
    const container = await metaFormPost(`/${igBusinessId}/media`, {
      image_url: imageUrl,
      caption,
      access_token: accessToken,
    });
    const creationId = typeof container.id === "string" ? container.id : null;

    if (!creationId) {
      throw new Error("Instagram container creation did not return an ID.");
    }

    const published = await metaFormPost(`/${igBusinessId}/media_publish`, {
      creation_id: creationId,
      access_token: accessToken,
    });
    const externalPostId = typeof published.id === "string" ? published.id : null;

    if (!externalPostId) {
      throw new Error("Instagram publish did not return a media ID.");
    }

    return {
      ok: true,
      platform: "instagram",
      externalPostId,
      error: null,
    };
  } catch (error) {
    return {
      ok: false,
      platform: "instagram",
      externalPostId: null,
      error: error instanceof Error ? error.message : "Instagram publishing failed.",
    };
  }
}

export async function publishToFacebook(
  imageUrl: string,
  caption: string,
): Promise<PublishPlatformResult> {
  if (!canPublishToFacebook()) {
    return publishMock("facebook");
  }

  const { accessToken, fbPageId } = getMetaConfig();

  try {
    // Production hardening still needed:
    // - validate page permissions and long-lived token freshness
    // - store raw response metadata for audit/debugging
    // - add retry logic for transient Graph API errors
    const published = await metaFormPost(`/${fbPageId}/photos`, {
      url: imageUrl,
      caption,
      published: "true",
      access_token: accessToken,
    });
    const externalPostId =
      typeof published.post_id === "string"
        ? published.post_id
        : typeof published.id === "string"
          ? published.id
          : null;

    if (!externalPostId) {
      throw new Error("Facebook publish did not return a post ID.");
    }

    return {
      ok: true,
      platform: "facebook",
      externalPostId,
      error: null,
    };
  } catch (error) {
    return {
      ok: false,
      platform: "facebook",
      externalPostId: null,
      error: error instanceof Error ? error.message : "Facebook publishing failed.",
    };
  }
}

export async function publishToBoth(
  imageUrl: string,
  caption: string,
): Promise<PublishResult> {
  const [facebook, instagram] = await Promise.all([
    publishToFacebook(imageUrl, caption),
    publishToInstagram(imageUrl, caption),
  ]);

  const ok = facebook.ok && instagram.ok;

  return {
    ok,
    platform: "both",
    externalPostId: ok
      ? `${facebook.externalPostId ?? ""}|${instagram.externalPostId ?? ""}`
      : null,
    error: ok ? null : [facebook.error, instagram.error].filter(Boolean).join("; "),
    results: [facebook, instagram],
  };
}

export async function publishContent(input: {
  platform: Platform;
  imageUrl: string;
  caption: string;
}): Promise<PublishResult> {
  if (input.platform === "instagram") {
    const result = await publishToInstagram(input.imageUrl, input.caption);
    return {
      ok: result.ok,
      platform: "instagram",
      externalPostId: result.externalPostId,
      error: result.error,
      results: [result],
    };
  }

  if (input.platform === "facebook") {
    const result = await publishToFacebook(input.imageUrl, input.caption);
    return {
      ok: result.ok,
      platform: "facebook",
      externalPostId: result.externalPostId,
      error: result.error,
      results: [result],
    };
  }

  return publishToBoth(input.imageUrl, input.caption);
}
