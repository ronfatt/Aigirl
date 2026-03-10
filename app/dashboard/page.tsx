"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { LoadingState } from "@/components/LoadingState";
import { StatsCard } from "@/components/StatsCard";
import { StatusBadge } from "@/components/StatusBadge";
import { DashboardPayload } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const response = await fetch("/api/dashboard");

        if (!response.ok) {
          throw new Error("Unable to load dashboard.");
        }

        const payload = (await response.json()) as DashboardPayload;

        if (active) {
          setDashboard(payload);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard.");
        }
      }
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <Header
        title="Dashboard"
        description="Track persona inventory, recent generations, and the current publishing pipeline."
      />

      {!dashboard && !error ? <LoadingState label="Loading dashboard" /> : null}
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      {dashboard ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatsCard
              label="Total characters"
              value={dashboard.metrics.totalCharacters}
              hint="Active personas available for generation"
            />
            <StatsCard
              label="Generated images"
              value={dashboard.metrics.totalGeneratedImages}
              hint="All images created across generations"
            />
            <StatsCard
              label="Draft posts"
              value={dashboard.metrics.totalDraftedPosts}
              hint="Posts waiting for review and publishing"
            />
            <StatsCard
              label="Published posts"
              value={dashboard.metrics.totalPublishedPosts}
              hint="Completed publish requests"
            />
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            <section className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 shadow-panel">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Recent Generations</h3>
                <p className="text-sm text-zinc-500">{dashboard.recentGenerations.length} items</p>
              </div>
              <div className="space-y-4">
                {dashboard.recentGenerations.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-black/10 p-4"
                  >
                    <div>
                      <p className="font-medium text-white">{item.characterName}</p>
                      <p className="text-sm text-zinc-400">{item.sceneTitle}</p>
                      <p className="mt-1 text-xs text-zinc-500">{formatDate(item.createdAt)}</p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 shadow-panel">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Recent Posts</h3>
                <p className="text-sm text-zinc-500">{dashboard.recentPosts.length} items</p>
              </div>
              <div className="space-y-4">
                {dashboard.recentPosts.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[84px,1fr] gap-4 rounded-2xl border border-white/5 bg-black/10 p-4"
                  >
                    <div className="relative h-20 overflow-hidden rounded-2xl">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.characterName} fill className="object-cover" />
                      ) : null}
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{item.characterName}</p>
                        <p className="line-clamp-2 text-sm text-zinc-400">{item.caption}</p>
                        <p className="mt-1 text-xs text-zinc-500">{formatDate(item.updatedAt)}</p>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}
