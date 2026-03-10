"use client";

import { useState } from "react";
import { MetaConnectionTestResult } from "@/lib/types";

export function MetaConnectionCard() {
  const [result, setResult] = useState<MetaConnectionTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleTest() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/meta/test-facebook", {
        cache: "no-store",
      });
      const payload = (await response.json()) as MetaConnectionTestResult & {
        message?: string;
      };

      setResult(payload);

      if (!response.ok && payload.message) {
        setError(payload.message);
      }
    } catch (requestError) {
      setResult(null);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to test Facebook connection.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
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
          onClick={handleTest}
          disabled={loading}
          className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Testing..." : "Test Facebook Publish Connection"}
        </button>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-4 text-sm text-zinc-300">
          <p className={result.ok ? "text-emerald-300" : "text-amber-300"}>
            {result.ok ? "Connection OK" : "Connection failed"}
          </p>
          <p className="mt-2 text-zinc-300">{result.message}</p>
          <div className="mt-3 grid gap-2 text-zinc-400 md:grid-cols-3">
            <p>Mode: {result.mode}</p>
            <p>Page ID: {result.details.pageId ?? "Not set"}</p>
            <p>Page name: {result.details.pageName ?? "Unknown"}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
