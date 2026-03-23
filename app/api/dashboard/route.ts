import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/db";
import { DashboardPayload } from "@/lib/types";

function buildEmptyDashboardPayload(warning: string): DashboardPayload {
  return {
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
    warning,
  };
}

export async function GET() {
  try {
    const dashboard = await getDashboardData();
    return NextResponse.json(dashboard);
  } catch (error) {
    const warning = error instanceof Error ? error.message : "Unable to load dashboard.";
    return NextResponse.json(buildEmptyDashboardPayload(warning));
  }
}
