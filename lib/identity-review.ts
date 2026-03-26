import {
  Character,
  Generation,
  IdentityReview,
  IdentityReviewLevel,
  ShotType,
  StyleMode,
} from "@/lib/types";

type IdentityRiskInput = {
  character: Pick<
    Character,
    | "masterReferenceImageUrl"
    | "faceReferenceImageUrl"
    | "styleReferenceImageUrl"
    | "bodyReferenceImageUrl"
    | "identityLockStrength"
  >;
  mode: StyleMode;
  shotType: ShotType;
  customPromptUsed?: boolean;
};

type IdentityReviewInput = IdentityRiskInput & {
  qualityTags: Generation["qualityTags"];
};

export function getCharacterReferenceSlotCount(
  character: Pick<
    Character,
    | "masterReferenceImageUrl"
    | "faceReferenceImageUrl"
    | "styleReferenceImageUrl"
    | "bodyReferenceImageUrl"
  >,
) {
  return [
    character.masterReferenceImageUrl,
    character.faceReferenceImageUrl,
    character.styleReferenceImageUrl,
    character.bodyReferenceImageUrl,
  ].filter(Boolean).length;
}

export function getIdentityRiskScore(input: IdentityRiskInput) {
  const referenceSlotCount = getCharacterReferenceSlotCount(input.character);
  let riskScore = 18;

  if (input.character.identityLockStrength === "balanced") {
    riskScore += 20;
  } else if (input.character.identityLockStrength === "high") {
    riskScore += 10;
  }

  if (referenceSlotCount <= 1) {
    riskScore += 28;
  } else if (referenceSlotCount === 2) {
    riskScore += 12;
  }

  if (input.mode === "sensual") {
    riskScore += 14;
  } else if (input.mode === "selfie") {
    riskScore += 8;
  }

  if (input.shotType === "close") {
    riskScore += 16;
  } else if (input.shotType === "half-body") {
    riskScore += 8;
  }

  if (input.customPromptUsed) {
    riskScore += 5;
  }

  return Math.max(0, Math.min(100, riskScore));
}

export function buildIdentityReview(input: IdentityReviewInput): IdentityReview {
  let riskScore = getIdentityRiskScore(input);

  if (input.qualityTags.includes("off-identity risk")) {
    riskScore += 12;
  }

  if (input.qualityTags.includes("face stable")) {
    riskScore -= 10;
  }

  const confidence = Math.max(5, Math.min(98, 100 - riskScore));
  let level: IdentityReviewLevel;
  let summary: string;
  let recommendation: string;

  if (riskScore >= 60) {
    level = "high-risk";
    summary = "Higher chance of face drift in this set.";
    recommendation = "Use a dedicated face reference and move identity lock to High or Max.";
  } else if (riskScore >= 38) {
    level = "review";
    summary = "Looks usable, but the face should be checked before exporting.";
    recommendation = "Review the eyes and jawline first, then favorite only the strongest frame.";
  } else {
    level = "stable";
    summary = "Identity looks relatively locked for this setup.";
    recommendation = "This setup is safe to repeat if the overall scene quality is strong.";
  }

  return {
    level,
    confidence,
    summary,
    recommendation,
  };
}
