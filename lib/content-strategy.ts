import { sceneLibrary } from "@/lib/scene-library";
import {
  ContentBucket,
  GenerationHistoryItem,
  SceneTemplate,
  StyleMode,
  WeeklyPlanItem,
} from "@/lib/types";

type BucketPlan = {
  targetPercent: number;
  sceneIds: string[];
  label: string;
};

const defaultBucketPlans: Record<ContentBucket, BucketPlan> = {
  selfie: {
    targetPercent: 35,
    sceneIds: ["mirror-selfie", "car-selfie", "cafe-window"],
    label: "Selfie",
  },
  lifestyle: {
    targetPercent: 25,
    sceneIds: ["morning-coffee", "weekend-brunch", "reading-sofa", "work-desk", "bookstore"],
    label: "Lifestyle",
  },
  travel: {
    targetPercent: 20,
    sceneIds: ["airport-waiting", "beach-walk", "poolside", "hotel-morning", "city-shopping"],
    label: "Travel",
  },
  gym: {
    targetPercent: 10,
    sceneIds: ["casual-gym"],
    label: "Gym",
  },
  sexy: {
    targetPercent: 10,
    sceneIds: ["poolside", "sunset-balcony", "casual-dinner", "hotel-morning"],
    label: "Sexy",
  },
};

function getBucketPlans(mode: StyleMode, sensualSexyTarget = 15) {
  if (mode === "sensual") {
    const sexyTarget = Math.max(15, Math.min(30, sensualSexyTarget));
    const delta = sexyTarget - 15;
    const selfieReduction = Math.round(delta * 0.6);
    const lifestyleReduction = delta - selfieReduction;

    return {
      ...defaultBucketPlans,
      selfie: {
        ...defaultBucketPlans.selfie,
        targetPercent: 30 - selfieReduction,
      },
      lifestyle: {
        ...defaultBucketPlans.lifestyle,
        targetPercent: 25 - lifestyleReduction,
      },
      travel: {
        ...defaultBucketPlans.travel,
        targetPercent: 20,
      },
      gym: {
        ...defaultBucketPlans.gym,
        targetPercent: 10,
      },
      sexy: {
        ...defaultBucketPlans.sexy,
        targetPercent: sexyTarget,
        sceneIds: [
          "poolside",
          "hotel-morning",
          "mirror-selfie",
          "sunset-balcony",
          "casual-dinner",
          "rooftop-evening",
        ],
      },
    } satisfies Record<ContentBucket, BucketPlan>;
  }

  return defaultBucketPlans;
}

function getBucketForScene(sceneId: string, bucketPlans: Record<ContentBucket, BucketPlan>): ContentBucket {
  if (bucketPlans.selfie.sceneIds.includes(sceneId)) return "selfie";
  if (bucketPlans.travel.sceneIds.includes(sceneId)) return "travel";
  if (bucketPlans.gym.sceneIds.includes(sceneId)) return "gym";
  if (bucketPlans.sexy.sceneIds.includes(sceneId)) return "sexy";
  return "lifestyle";
}

export function getContentMixSummary(
  history: GenerationHistoryItem[],
  mode: StyleMode = "lifestyle",
  sensualSexyTarget = 15,
) {
  const bucketPlans = getBucketPlans(mode, sensualSexyTarget);
  const total = history.length || 1;

  const actualPercentages = (Object.keys(bucketPlans) as ContentBucket[]).map((bucket) => {
    const count = history.filter((item) => getBucketForScene(item.sceneTemplateId, bucketPlans) === bucket).length;
    const actualPercent = Math.round((count / total) * 100);
    const targetPercent = bucketPlans[bucket].targetPercent;

    return {
      bucket,
      label: bucketPlans[bucket].label,
      targetPercent,
      actualPercent,
      gap: targetPercent - actualPercent,
    };
  });

  const nextBucket = [...actualPercentages].sort((a, b) => b.gap - a.gap)[0];
  const candidateSceneId = bucketPlans[nextBucket.bucket].sceneIds.find(
    (sceneId) => !history.some((item) => item.sceneTemplateId === sceneId),
  )
    ?? bucketPlans[nextBucket.bucket].sceneIds[0];
  const recommendedScene =
    sceneLibrary.find((scene) => scene.id === candidateSceneId) ?? sceneLibrary[0];

  return {
    buckets: actualPercentages,
    nextBucket,
    recommendedScene,
    mixLabel:
      mode === "sensual"
        ? `${bucketPlans.selfie.targetPercent}% selfie, ${bucketPlans.lifestyle.targetPercent}% lifestyle, 20% travel, 10% gym, ${bucketPlans.sexy.targetPercent}% sexy`
        : "35% selfie, 25% lifestyle, 20% travel, 10% gym, 10% sexy",
  };
}

export function getSceneRatioHint(
  scene: SceneTemplate,
  mode: StyleMode = "lifestyle",
  sensualSexyTarget = 15,
) {
  const bucketPlans = getBucketPlans(mode, sensualSexyTarget);
  const bucket = getBucketForScene(scene.id, bucketPlans);
  return bucketPlans[bucket];
}

export function buildWeeklyPlan(history: GenerationHistoryItem[]): WeeklyPlanItem[] {
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const sceneSequence = [
    { mode: "lifestyle" as StyleMode, reason: "Anchor the week with a reliable everyday post." },
    { mode: "selfie" as StyleMode, reason: "Add a more personal handheld update." },
    { mode: "lifestyle" as StyleMode, reason: "Keep the feed grounded with a lighter routine scene." },
    { mode: "sensual" as StyleMode, reason: "Use a more polished, higher-attention post midweek." },
    { mode: "lifestyle" as StyleMode, reason: "Refresh the feed with a change of background." },
    { mode: "selfie" as StyleMode, reason: "Close the week with a direct personal post." },
    { mode: "sensual" as StyleMode, reason: "Reserve one stronger glam post for the weekend." },
  ];

  return dayLabels.map((dayLabel, index) => {
    const item = sceneSequence[index];
    const summary = getContentMixSummary(
      history,
      item.mode,
      item.mode === "sensual" ? 18 : 15,
    );

    return {
      dayLabel,
      mode: item.mode,
      sceneId: summary.recommendedScene.id,
      sceneTitle: summary.recommendedScene.title,
      reason: item.reason,
    };
  });
}
