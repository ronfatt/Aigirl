"use client";

import { useState } from "react";
import { MetaConnectionTestResult } from "@/lib/types";

export function MetaConnectionCard() {
  const [facebookResult, setFacebookResult] = useState<MetaConnectionTestResult | null>(null);
  const [instagramResult, setInstagramResult] = useState<MetaConnectionTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingPlatform, setLoadingPlatform] = useState<"facebook" | "instagram" | null>(null);

  async function handleTest(platform: "facebook" | "instagram") {
    setLoadingPlatform(platform);
    setError(null);

    try {
      const response = await fetch(`/api/meta/test-${platform}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as MetaConnectionTestResult & {
        message?: string;
      };

      if (platform === "facebook") {
        setFacebookResult(payload);
      } else {
        setInstagramResult(payload);
      }

      if (!response.ok && payload.message) {
        setError(payload.message);
      }
    } catch (requestError) {
      if (platform === "facebook") {
        setFacebookResult(null);
      } else {
        setInstagramResult(null);
      }
      setError(
        requestError instanceof Error
          ? requestError.message
          : `Unable to test ${platform} connection.`,
      );
    } finally {
      setLoadingPlatform(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Facebook Connection Test</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Validate the current `META_ACCESS_TOKEN` and `META_FB_PAGE_ID` without publishing a real post.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleTest("facebook")}
            disabled={loadingPlatform !== null}
            className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingPlatform === "facebook" ? "Testing..." : "Test Facebook Publish Connection"}
          </button>
        </div>

        {facebookResult ? <ResultBlock result={facebookResult} /> : null}
      </div>

      <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
        <div>
          <h3 className="text-lg font-semibold text-white">Instagram Connection Test</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Validate the current `META_ACCESS_TOKEN` and `META_IG_BUSINESS_ID` without publishing a real post.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleTest("instagram")}
          disabled={loadingPlatform !== null}
          className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingPlatform === "instagram" ? "Testing..." : "Test Instagram Publish Connection"}
        </button>
      </div>

      {instagramResult ? <ResultBlock result={instagramResult} /> : null}

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}
    </div>
  );
}

function ResultBlock({ result }: { result: MetaConnectionTestResult }) {
  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-4 text-sm text-zinc-300">
      <p className={result.ok ? "text-emerald-300" : "text-amber-300"}>
        {result.ok ? "Connection OK" : "Connection failed"}
      </p>
      <p className="mt-2 text-zinc-300">{result.message}</p>
      <div className="mt-3 grid gap-2 text-zinc-400 md:grid-cols-3">
        <p>Mode: {result.mode}</p>
        <p>ID: {result.details.pageId ?? "Not set"}</p>
        <p>Name: {result.details.pageName ?? "Unknown"}</p>
      </div>
    </div>
  );
}
