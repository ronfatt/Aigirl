import {
  MetaConnectionTestResult,
  Platform,
  PublishPlatformResult,
  PublishResult,
} from "@/lib/types";

const META_GRAPH_BASE_URL = "https://graph.facebook.com/v23.0";
const IG_CONTAINER_READY_ATTEMPTS = 8;
const IG_CONTAINER_READY_DELAY_MS = 2000;

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

async function getFacebookPageContext() {
  const { accessToken, fbPageId } = getMetaConfig();

  const page = await metaGet(`/${fbPageId}`, {
    fields: "id,name,access_token",
    access_token: accessToken,
  });

  const pageAccessToken =
    typeof page.access_token === "string" ? page.access_token : null;

  if (!pageAccessToken) {
    throw new Error(
      "Facebook Page access token was not returned. Check pages_show_list, pages_read_engagement, and pages_manage_posts permissions for this user.",
    );
  }

  return {
    pageId: typeof page.id === "string" ? page.id : fbPageId,
    pageName: typeof page.name === "string" ? page.name : null,
    pageAccessToken,
  };
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

async function metaGet(path: string, params: Record<string, string>) {
  const url = new URL(`${META_GRAPH_BASE_URL}${path}`);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Meta Graph API request failed (${response.status}): ${text || response.statusText}`);
  }

  return response.json() as Promise<Record<string, unknown>>;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForInstagramContainerReady(
  creationId: string,
  accessToken: string,
) {
  for (let attempt = 0; attempt < IG_CONTAINER_READY_ATTEMPTS; attempt += 1) {
    const container = await metaGet(`/${creationId}`, {
      fields: "id,status_code,status",
      access_token: accessToken,
    });

    const statusCode =
      typeof container.status_code === "string" ? container.status_code : null;
    const statusText =
      typeof container.status === "string" ? container.status : null;

    if (statusCode === "FINISHED") {
      return;
    }

    if (statusCode === "ERROR" || statusCode === "EXPIRED") {
      throw new Error(
        `Instagram media container is not publishable (${statusCode}${statusText ? `: ${statusText}` : ""}).`,
      );
    }

    if (attempt < IG_CONTAINER_READY_ATTEMPTS - 1) {
      await sleep(IG_CONTAINER_READY_DELAY_MS);
    }
  }

  throw new Error(
    "Instagram media container was created but did not become publishable in time. Check that the image URL is a direct public image and try again.",
  );
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

    await waitForInstagramContainerReady(creationId, accessToken);

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

export async function testInstagramConnection(): Promise<MetaConnectionTestResult> {
  if (!canPublishToInstagram()) {
    return {
      ok: false,
      platform: "instagram",
      mode: "mock",
      message:
        "Instagram publishing is running in mock mode because META_ACCESS_TOKEN or META_IG_BUSINESS_ID is missing.",
      details: {
        pageId: getMetaConfig().igBusinessId || undefined,
      },
    };
  }

  const { accessToken, igBusinessId } = getMetaConfig();

  try {
    const account = await metaGet(`/${igBusinessId}`, {
      fields: "id,username,name",
      access_token: accessToken,
    });

    return {
      ok: true,
      platform: "instagram",
      mode: "live",
      message:
        "Instagram publishing connection looks valid. The configured token can read the connected Instagram Business account.",
      details: {
        pageId: typeof account.id === "string" ? account.id : igBusinessId,
        pageName:
          typeof account.username === "string"
            ? account.username
            : typeof account.name === "string"
              ? account.name
              : null,
      },
    };
  } catch (error) {
    return {
      ok: false,
      platform: "instagram",
      mode: "live",
      message: error instanceof Error ? error.message : "Instagram connection test failed.",
      details: {
        pageId: igBusinessId || undefined,
      },
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

  const { fbPageId } = getMetaConfig();

  try {
    // Production hardening still needed:
    // - validate page permissions and long-lived token freshness
    // - store raw response metadata for audit/debugging
    // - add retry logic for transient Graph API errors
    const page = await getFacebookPageContext();
    const published = await metaFormPost(`/${fbPageId}/photos`, {
      url: imageUrl,
      caption,
      published: "true",
      access_token: page.pageAccessToken,
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

export async function testFacebookConnection(): Promise<MetaConnectionTestResult> {
  if (!canPublishToFacebook()) {
    return {
      ok: false,
      platform: "facebook",
      mode: "mock",
      message: "META_ACCESS_TOKEN or META_FB_PAGE_ID is missing, so live Facebook publishing is disabled.",
      details: {},
    };
  }

  const { accessToken, fbPageId } = getMetaConfig();

  try {
    const [page, permissions] = await Promise.all([
      getFacebookPageContext(),
      metaGet("/me/permissions", {
        access_token: accessToken,
      }),
    ]);

    const permissionEntries = Array.isArray(permissions.data) ? permissions.data : [];

    return {
      ok: true,
      platform: "facebook",
      mode: "live",
      message:
        "Facebook Page connection looks valid. The user token can fetch a Page access token for the configured page.",
      details: {
        pageId: page.pageId ?? fbPageId,
        pageName: page.pageName,
        tokenScopeCount: permissionEntries.length,
      },
    };
  } catch (error) {
    return {
      ok: false,
      platform: "facebook",
      mode: "live",
      message: error instanceof Error ? error.message : "Facebook connection test failed.",
      details: {
        pageId: fbPageId,
      },
    };
  }
}
