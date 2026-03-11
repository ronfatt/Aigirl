import { sceneLibrary } from "@/lib/scene-library";
import { ContentBucket, GenerationHistoryItem, SceneTemplate, StyleMode } from "@/lib/types";

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

function getBucketPlans(mode: StyleMode) {
  if (mode === "sensual") {
    return {
      ...defaultBucketPlans,
      selfie: {
        ...defaultBucketPlans.selfie,
        targetPercent: 30,
      },
      lifestyle: {
        ...defaultBucketPlans.lifestyle,
        targetPercent: 20,
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
        targetPercent: 20,
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

export function getContentMixSummary(history: GenerationHistoryItem[], mode: StyleMode = "lifestyle") {
  const bucketPlans = getBucketPlans(mode);
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
        ? "30% selfie, 20% lifestyle, 20% travel, 10% gym, 20% sexy"
        : "35% selfie, 25% lifestyle, 20% travel, 10% gym, 10% sexy",
  };
}

export function getSceneRatioHint(scene: SceneTemplate, mode: StyleMode = "lifestyle") {
  const bucketPlans = getBucketPlans(mode);
  const bucket = getBucketForScene(scene.id, bucketPlans);
  return bucketPlans[bucket];
}
