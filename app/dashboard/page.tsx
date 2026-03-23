"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { LoadingState } from "@/components/LoadingState";
import { StatsCard } from "@/components/StatsCard";
import { DashboardPayload } from "@/lib/types";

const quickButtons = [
  { label: "Generate Images", href: "/generate" },
  { label: "Open Gallery", href: "/gallery" },
  { label: "Open Exports", href: "/posts" },
  { label: "Edit Character", href: "/character" },
];

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const response = await fetch("/api/dashboard");
        const payload = (await response.json()) as DashboardPayload | { error?: string };

        if (!response.ok) {
          throw new Error(("error" in payload && payload.error) || "Unable to load dashboard.");
        }

        if (active) {
          setDashboard(payload as DashboardPayload);
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

  const nextAction = useMemo(() => {
    if (!dashboard) {
      return null;
    }

    if (!dashboard.metrics.totalCharacters) {
      return {
        title: "Create your first character",
        body: "Start with one persona, upload a strong reference photo, then generate a few test stills.",
        href: "/character",
        cta: "Go to Character",
      };
    }

    if (!dashboard.metrics.totalGeneratedImages) {
      return {
        title: "Generate your first stills",
        body: "Pick a scene, approve the best image, and start building your library.",
        href: "/generate",
        cta: "Go to Generate",
      };
    }

    if (!dashboard.metrics.totalVideoClips) {
      return {
        title: "Save your first clip draft",
        body: "Render one short vertical clip from an approved still so you have both image and reel assets ready.",
        href: "/generate",
        cta: "Make a clip",
      };
    }

    return {
      title: "Keep building the library",
      body: "Add a few more approved stills, save more clips, and package better exports for manual Instagram posting.",
      href: "/gallery",
      cta: "Open Gallery",
    };
  }, [dashboard]);

  return (
    <div>
      <Header
        title="Dashboard"
        description="A simple control panel for building image assets, clip drafts, and captions for manual Instagram posting."
      />

      {!dashboard && !error ? <LoadingState label="Loading dashboard" /> : null}

      {error ? (
        <div className="rounded-[1.4rem] border border-rose-300/20 bg-rose-400/[0.05] p-5">
          <p className="text-sm font-medium text-rose-200">Unable to load dashboard</p>
          <p className="mt-2 text-sm text-rose-200/80">
            I added a fallback for missing clip tables. If this still shows up after refresh, we will trace the remaining API error next.
          </p>
        </div>
      ) : null}

      {dashboard && nextAction ? (
        <div className="space-y-6">
          <section className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Next step</p>
              <h3 className="mt-3 text-2xl font-semibold text-white">{nextAction.title}</h3>
              <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">{nextAction.body}</p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={nextAction.href}
                  className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-zinc-100"
                >
                  {nextAction.cta}
                </Link>
                <Link
                  href="/posts"
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-white transition hover:bg-white/[0.08]"
                >
                  Open Exports
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {quickButtons.map((button) => (
                <Link
                  key={button.label}
                  href={button.href}
                  className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-5 text-sm font-medium text-white transition hover:bg-white/[0.08]"
                >
                  {button.label}
                </Link>
              ))}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <StatsCard
              label="Characters"
              value={dashboard.metrics.totalCharacters}
              hint="Active personas"
            />
            <StatsCard
              label="Images"
              value={dashboard.metrics.totalGeneratedImages}
              hint="Total generated stills"
            />
            <StatsCard
              label="Caption drafts"
              value={dashboard.metrics.totalDraftedPosts}
              hint="Ready for export review"
            />
            <StatsCard
              label="Saved clips"
              value={dashboard.metrics.totalVideoClips}
              hint="Vertical video drafts"
            />
            <StatsCard
              label="Planner days"
              value={dashboard.weeklyPlan.length}
              hint="Suggested next scenes"
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-3">
            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 shadow-panel xl:col-span-1">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-white">Today</h3>
                <Link href="/generate" className="text-sm text-zinc-400 transition hover:text-white">
                  Open
                </Link>
              </div>
              <div className="mt-4 space-y-3 text-sm text-zinc-300">
                <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  1. Generate one new scene
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  2. Approve the best still
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  3. Save one vertical clip draft
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  4. Finalize one export package
                </div>
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 shadow-panel xl:col-span-1">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-white">Recent Scenes</h3>
                <Link href="/gallery" className="text-sm text-zinc-400 transition hover:text-white">
                  Gallery
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {dashboard.recentGenerations.slice(0, 4).map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                    <p className="font-medium text-white">{item.sceneTitle}</p>
                    <p className="mt-1 text-sm text-zinc-400">{item.characterName}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-zinc-500">
                      {item.mode} • {item.shotType}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 shadow-panel xl:col-span-1">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-white">Planner</h3>
                <Link href="/generate" className="text-sm text-zinc-400 transition hover:text-white">
                  Generate
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {dashboard.weeklyPlan.slice(0, 4).map((item) => (
                  <Link
                    key={`${item.dayLabel}-${item.sceneId}`}
                    href={`/generate?sceneId=${item.sceneId}&mode=${item.mode}`}
                    className="block rounded-2xl border border-white/10 bg-black/10 p-4 transition hover:bg-white/[0.06]"
                  >
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{item.dayLabel}</p>
                    <p className="mt-2 font-medium text-white">{item.sceneTitle}</p>
                    <p className="mt-1 text-sm text-zinc-400">{item.reason}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
