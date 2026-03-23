"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { LoadingState } from "@/components/LoadingState";
import { StatsCard } from "@/components/StatsCard";
import { StatusBadge } from "@/components/StatusBadge";
import { DashboardPayload } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const quickActions = [
  {
    title: "Generate visuals",
    description: "Create a new image set, approve a still, and start a clip draft.",
    href: "/generate",
  },
  {
    title: "Review gallery",
    description: "Filter your history, favorite keepers, and recover strong stills fast.",
    href: "/gallery",
  },
  {
    title: "Open exports",
    description: "Download images, saved clips, and final captions for manual posting.",
    href: "/posts",
  },
];

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

  const dashboardPulse = useMemo(() => {
    if (!dashboard) {
      return null;
    }

    const approvedGenerations = dashboard.recentGenerations.filter((item) => item.status === "approved").length;
    const readyCaptions = dashboard.recentPosts.filter((item) => item.status === "draft").length;
    const savedClips = dashboard.metrics.totalVideoClips;

    return {
      approvedGenerations,
      readyCaptions,
      savedClips,
    };
  }, [dashboard]);

  return (
    <div>
      <Header
        title="Studio Dashboard"
        description="Keep the whole manual Instagram workflow in one place: generate, curate, save clips, and package exports without touching direct social posting."
      />

      {!dashboard && !error ? <LoadingState label="Loading dashboard" /> : null}
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      {dashboard && dashboardPulse ? (
        <>
          <section className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
            <div className="overflow-hidden rounded-[1.9rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-panel">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <p className="text-xs uppercase tracking-[0.28em] text-zinc-400">Creator cockpit</p>
                  <h3 className="mt-3 text-3xl font-semibold text-white">Today&apos;s asset flow is ready</h3>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-300">
                    Treat this as your daily control room: generate the next still, save a clip draft,
                    then move the best assets into exports for manual posting.
                  </p>
                </div>

                <div className="grid min-w-[240px] gap-3 rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Studio pulse</p>
                    <p className="mt-2 text-lg font-medium text-white">
                      {dashboardPulse.approvedGenerations} approved visuals, {dashboardPulse.savedClips} saved clips
                    </p>
                  </div>
                  <div className="grid gap-2 text-sm text-zinc-400">
                    <p>Caption drafts ready: {dashboardPulse.readyCaptions}</p>
                    <p>Weekly prompts queued: {dashboard.weeklyPlan.length}</p>
                    <p>Total active personas: {dashboard.metrics.totalCharacters}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="rounded-[1.3rem] border border-white/10 bg-black/20 p-4 transition hover:border-white/20 hover:bg-white/[0.05]"
                  >
                    <p className="text-sm font-medium text-white">{action.title}</p>
                    <p className="mt-2 text-xs leading-5 text-zinc-400">{action.description}</p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
              <StatsCard
                label="Characters"
                value={dashboard.metrics.totalCharacters}
                hint="Personas currently available for still and clip generation"
              />
              <StatsCard
                label="Generated stills"
                value={dashboard.metrics.totalGeneratedImages}
                hint="Total images created across all approved and archived generations"
              />
              <StatsCard
                label="Caption drafts"
                value={dashboard.metrics.totalDraftedPosts}
                hint="Export drafts waiting for your final manual posting pass"
              />
              <StatsCard
                label="Saved clips"
                value={dashboard.metrics.totalVideoClips}
                hint="Motion drafts already rendered and saved into the library"
              />
            </div>
          </section>

          <section className="mt-8 grid gap-6 xl:grid-cols-[1fr,1fr]">
            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 shadow-panel">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Recent approved visuals</h3>
                  <p className="text-sm text-zinc-400">
                    The latest stills you can turn into captions, clips, or manual exports.
                  </p>
                </div>
                <Link href="/generate" className="text-sm text-zinc-400 transition hover:text-white">
                  Open generate
                </Link>
              </div>

              <div className="space-y-4">
                {dashboard.recentGenerations.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[90px,1fr] gap-4 rounded-[1.3rem] border border-white/10 bg-black/10 p-4"
                  >
                    <div className="relative h-24 overflow-hidden rounded-2xl bg-white/5">
                      {item.selectedImageUrl || item.imageUrls[0] ? (
                        <Image
                          src={item.selectedImageUrl ?? item.imageUrls[0]}
                          alt={item.characterName}
                          fill
                          className="object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{item.characterName}</p>
                        <p className="text-sm text-zinc-400">{item.sceneTitle}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">
                          {item.mode} • {item.shotType}
                        </p>
                        <p className="mt-2 text-xs text-zinc-500">{formatDate(item.createdAt)}</p>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 shadow-panel">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Saved clip drafts</h3>
                  <p className="text-sm text-zinc-400">
                    Short vertical motion assets already rendered and ready for manual posting.
                  </p>
                </div>
                <Link href="/posts" className="text-sm text-zinc-400 transition hover:text-white">
                  Open exports
                </Link>
              </div>

              {dashboard.recentVideoClips.length ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {dashboard.recentVideoClips.map((clip) => (
                    <div
                      key={clip.id}
                      className="overflow-hidden rounded-[1.3rem] border border-white/10 bg-black/10"
                    >
                      <div className="relative h-56 bg-white/5">
                        <video
                          controls
                          playsInline
                          poster={clip.thumbnailUrl}
                          src={clip.videoUrl}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="space-y-2 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-white">{clip.characterName}</p>
                            <p className="text-sm text-zinc-400">{clip.sceneTitle}</p>
                          </div>
                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                            {clip.durationSeconds}s
                          </span>
                        </div>
                        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                          {clip.motionLabel}
                        </p>
                        <p className="text-xs text-zinc-500">{formatDate(clip.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-52 items-center justify-center rounded-[1.3rem] border border-dashed border-white/10 bg-black/10 text-sm text-zinc-500">
                  Render and save a clip draft from Generate to see it here.
                </div>
              )}
            </div>
          </section>

          <section className="mt-8 grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 shadow-panel">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Recent export drafts</h3>
                  <p className="text-sm text-zinc-400">
                    Captions and stills already organized for your manual Instagram workflow.
                  </p>
                </div>
                <Link href="/posts" className="text-sm text-zinc-400 transition hover:text-white">
                  Open exports
                </Link>
              </div>

              <div className="space-y-4">
                {dashboard.recentPosts.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[84px,1fr] gap-4 rounded-[1.3rem] border border-white/10 bg-black/10 p-4"
                  >
                    <div className="relative h-20 overflow-hidden rounded-2xl bg-white/5">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.characterName} fill className="object-cover" />
                      ) : null}
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{item.characterName}</p>
                        <p className="line-clamp-2 text-sm text-zinc-400">{item.caption}</p>
                        <p className="mt-2 text-xs text-zinc-500">{formatDate(item.updatedAt)}</p>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 shadow-panel">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Weekly content planner</h3>
                  <p className="text-sm text-zinc-400">
                    A 7-day asset rhythm to keep stills, selfie content, sensual posts, and travel beats balanced.
                  </p>
                </div>
                <p className="text-sm text-zinc-500">{dashboard.weeklyPlan.length} days</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {dashboard.weeklyPlan.map((item) => (
                  <div
                    key={`${item.dayLabel}-${item.sceneId}`}
                    className="rounded-[1.3rem] border border-white/10 bg-black/10 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">{item.dayLabel}</p>
                        <p className="mt-2 font-medium text-white">{item.sceneTitle}</p>
                      </div>
                      <StatusBadge status={item.mode === "sensual" ? "suggestive" : "safe"} />
                    </div>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-zinc-500">{item.mode}</p>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">{item.reason}</p>
                    <Link
                      href={`/generate?sceneId=${item.sceneId}&mode=${item.mode}`}
                      className="mt-4 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white transition hover:bg-white/[0.08]"
                    >
                      Build this scene
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
