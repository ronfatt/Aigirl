import { sceneLibrary } from "@/lib/scene-library";
import { GenerationHistoryItem, SceneTemplate, ContentBucket } from "@/lib/types";

type BucketPlan = {
  targetPercent: number;
  sceneIds: string[];
  label: string;
};

const bucketPlans: Record<ContentBucket, BucketPlan> = {
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

function getBucketForScene(sceneId: string): ContentBucket {
  if (bucketPlans.selfie.sceneIds.includes(sceneId)) return "selfie";
  if (bucketPlans.travel.sceneIds.includes(sceneId)) return "travel";
  if (bucketPlans.gym.sceneIds.includes(sceneId)) return "gym";
  if (bucketPlans.sexy.sceneIds.includes(sceneId)) return "sexy";
  return "lifestyle";
}

export function getContentMixSummary(history: GenerationHistoryItem[]) {
  const total = history.length || 1;

  const actualPercentages = (Object.keys(bucketPlans) as ContentBucket[]).map((bucket) => {
    const count = history.filter((item) => getBucketForScene(item.sceneTemplateId) === bucket).length;
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
  };
}

export function getSceneRatioHint(scene: SceneTemplate) {
  const bucket = getBucketForScene(scene.id);
  return bucketPlans[bucket];
}
