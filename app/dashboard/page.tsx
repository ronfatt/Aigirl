"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { LoadingState } from "@/components/LoadingState";
import { StatsCard } from "@/components/StatsCard";
import { DashboardPayload } from "@/lib/types";

const quickButtons = [
  { label: "Generate", href: "/generate", hint: "Make new stills" },
  { label: "Library", href: "/gallery", hint: "Review your assets" },
  { label: "Exports", href: "/posts", hint: "Download asset packs" },
  { label: "Persona", href: "/character", hint: "Update one character" },
];

const emptyDashboard: DashboardPayload = {
  metrics: {
    totalCharacters: 0,
    totalGeneratedImages: 0,
    totalDraftedPosts: 0,
    totalPublishedPosts: 0,
    totalVideoClips: 0,
  },
  recentGenerations: [],
  recentPosts: [],
  recentVideoClips: [],
  weeklyPlan: [],
  warning: null,
};

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const response = await fetch("/api/dashboard");
        const payload = (await response.json()) as DashboardPayload;

        if (active) {
          setDashboard(response.ok ? payload : { ...emptyDashboard, warning: "Dashboard is temporarily using fallback data." });
        }
      } catch {
        if (active) {
          setDashboard({
            ...emptyDashboard,
            warning: "Dashboard is temporarily using fallback data. The rest of the app still works.",
          });
        }
      }
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const data = dashboard ?? emptyDashboard;
  const todayPack = data.weeklyPlan[0] ?? null;
  const plannerItems = data.weeklyPlan.slice(0, 3);

  const nextAction = useMemo(() => {
    if (!data.metrics.totalCharacters) {
      return {
        title: "Create one character first",
        body: "Set one persona, upload a strong face reference, then start generating a few test stills.",
        href: "/character",
        cta: "Open Persona",
      };
    }

    if (!data.metrics.totalGeneratedImages) {
      return {
        title: "Generate one new set",
        body: "Pick one scene, make a few stills, and approve the best result before building clips and exports.",
        href: "/generate",
        cta: "Open Create",
      };
    }

    if (!data.metrics.totalVideoClips) {
      return {
        title: "Save one clip draft",
        body: "Render one vertical clip from an approved still so each asset pack has both image and reel-ready material.",
        href: "/generate",
        cta: "Create clip",
      };
    }

    return {
      title: "Package your next export",
      body: "Open one approved still, review the clip draft, refine the caption, and download the full pack for manual posting.",
      href: "/posts",
      cta: "Open Exports",
    };
  }, [data]);

  return (
    <div>
      <Header
        title="Dashboard"
        description="A simple home screen for generating assets, reviewing your library, and preparing manual Instagram packs."
      />

      {!dashboard ? <LoadingState label="Loading dashboard" /> : null}

      {data.warning ? (
        <div className="mb-6 rounded-[1.4rem] border border-amber-300/20 bg-amber-400/[0.05] p-4">
          <p className="text-sm font-medium text-amber-100">Dashboard fallback active</p>
          <p className="mt-1 text-sm text-amber-100/80">{data.warning}</p>
        </div>
      ) : null}

      <div className="space-y-6">
        <section className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Next step</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">{nextAction.title}</h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">{nextAction.body}</p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={nextAction.href}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-zinc-100"
            >
              {nextAction.cta}
            </Link>
            <Link
              href={todayPack ? `/generate?sceneId=${todayPack.sceneId}&mode=${todayPack.mode}` : "/generate"}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-white transition hover:bg-white/[0.08]"
            >
              {todayPack ? "Create today’s pack" : "Open Create"}
            </Link>
            <Link
              href="/gallery"
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-white transition hover:bg-white/[0.08]"
            >
              Open Library
            </Link>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickButtons.map((button) => (
            <Link
              key={button.label}
              href={button.href}
              className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-5 transition hover:bg-white/[0.08]"
            >
              <p className="text-base font-medium text-white">{button.label}</p>
              <p className="mt-1 text-sm text-zinc-400">{button.hint}</p>
            </Link>
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatsCard label="Characters" value={data.metrics.totalCharacters} hint="Ready personas" />
          <StatsCard label="Images" value={data.metrics.totalGeneratedImages} hint="Saved stills" />
          <StatsCard label="Exports" value={data.metrics.totalDraftedPosts} hint="Draft packs" />
          <StatsCard label="Clips" value={data.metrics.totalVideoClips} hint="Saved drafts" />
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 shadow-panel">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">Today</h3>
              <Link
                href={todayPack ? `/generate?sceneId=${todayPack.sceneId}&mode=${todayPack.mode}` : "/generate"}
                className="text-sm text-zinc-400 transition hover:text-white"
              >
                Open Create
              </Link>
            </div>

            <div className="mt-4 space-y-3 text-sm text-zinc-300">
              <div className="rounded-2xl border border-emerald-300/15 bg-emerald-400/[0.05] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-200/70">Recommended</p>
                <p className="mt-2 font-medium text-white">
                  {todayPack?.sceneTitle ?? "Generate one new scene"}
                </p>
                <p className="mt-1 text-sm text-zinc-300">
                  {todayPack?.reason ?? "Generate, approve, save one clip, then package the export."}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">1. Generate one new set</div>
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">2. Approve one strong still</div>
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">3. Save one clip draft</div>
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">4. Open one export pack</div>
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 shadow-panel">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">Recent scenes</h3>
              <Link href="/gallery" className="text-sm text-zinc-400 transition hover:text-white">
                Open Library
              </Link>
            </div>

            {data.recentGenerations.length ? (
              <div className="mt-4 space-y-3">
                {data.recentGenerations.slice(0, 3).map((generation) => (
                  <div key={generation.id} className="rounded-[1.2rem] border border-white/10 bg-black/10 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-white">{generation.sceneTitle}</p>
                        <p className="mt-1 text-sm text-zinc-400">{generation.characterName}</p>
                      </div>
                      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{generation.mode}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-[1.2rem] border border-dashed border-white/10 bg-black/10 p-4 text-sm text-zinc-500">
                No recent scenes yet.
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 shadow-panel">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">Recent exports</h3>
              <Link href="/posts" className="text-sm text-zinc-400 transition hover:text-white">
                Open Exports
              </Link>
            </div>

            {data.recentPosts.length ? (
              <div className="mt-4 space-y-3">
                {data.recentPosts.slice(0, 3).map((post) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.id}`}
                    className="block rounded-[1.2rem] border border-white/10 bg-black/10 p-4 transition hover:bg-white/[0.05]"
                  >
                    <p className="text-sm font-medium text-white">{post.characterName}</p>
                    <p className="mt-1 text-sm text-zinc-400">{post.platform} • {post.status}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-[1.2rem] border border-dashed border-white/10 bg-black/10 p-4 text-sm text-zinc-500">
                No export packs yet.
              </div>
            )}
          </div>

          <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 shadow-panel">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">Planner</h3>
              <Link href="/generate" className="text-sm text-zinc-400 transition hover:text-white">
                Open Create
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {plannerItems.length ? (
                plannerItems.map((item) => (
                  <Link
                    key={`${item.dayLabel}-${item.sceneId}`}
                    href={`/generate?sceneId=${item.sceneId}&mode=${item.mode}`}
                    className="block rounded-[1.2rem] border border-white/10 bg-black/10 p-4 transition hover:bg-white/[0.05]"
                  >
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{item.dayLabel}</p>
                    <p className="mt-2 text-sm font-medium text-white">{item.sceneTitle}</p>
                    <p className="mt-1 text-sm text-zinc-400">{item.reason}</p>
                  </Link>
                ))
              ) : (
                <div className="rounded-[1.2rem] border border-dashed border-white/10 bg-black/10 p-4 text-sm text-zinc-500">
                  Planner suggestions will show up after a few more generations.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
