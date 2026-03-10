import { Platform, Post } from "@/lib/types";

async function publishMock(post: Post, platform: Platform) {
  const success = Math.random() > 0.12;

  return {
    ok: success,
    platform,
    externalPostId: success ? `${platform}_${post.id}` : null,
    error: success ? null : "Mock publish failure",
  };
}

export async function publishToInstagram(post: Post) {
  // Replace this mock with the Meta Graph API flow:
  // 1. Create media container
  // 2. Publish container
  // 3. Persist Meta IDs and logs
  return publishMock(post, "instagram");
}

export async function publishToFacebook(post: Post) {
  return publishMock(post, "facebook");
}

export async function publishToBoth(post: Post) {
  const [facebook, instagram] = await Promise.all([
    publishToFacebook(post),
    publishToInstagram(post),
  ]);

  const ok = facebook.ok && instagram.ok;

  return {
    ok,
    platform: "both" as const,
    externalPostId: ok
      ? `${facebook.externalPostId ?? ""}|${instagram.externalPostId ?? ""}`
      : null,
    error: ok ? null : [facebook.error, instagram.error].filter(Boolean).join("; "),
  };
}
