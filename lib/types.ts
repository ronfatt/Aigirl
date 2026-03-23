export type Platform = "facebook" | "instagram" | "both";
export type PostStatus = "draft" | "queued" | "published" | "failed";
export type GenerationStatus = "draft" | "completed" | "approved" | "failed";
export type RiskLevel = "safe" | "suggestive" | "restricted";
export type StyleMode = "lifestyle" | "selfie" | "sensual";
export type SensualPoseBias = "soft glam" | "playful" | "confident";
export type ShotType = "close" | "half-body" | "three-quarter" | "full-body";
export type QualityTag =
  | "face stable"
  | "framing good"
  | "background clear"
  | "publish-ready";
export type PostingTone =
  | "soft lifestyle"
  | "casual intimate"
  | "playful"
  | "elegant minimal";

export interface Character {
  id: string;
  name: string;
  displayName: string;
  ageRange: string;
  identityStyle: string;
  city: string;
  bio: string;
  vibe: string;
  appearanceDescription: string;
  masterReferenceImageUrl: string;
  stylePrompt: string;
  negativePrompt: string;
  postingTone: PostingTone;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SceneTemplate {
  id: string;
  title: string;
  category: string;
  promptTemplate: string;
  captionHint: string;
  riskLevel: RiskLevel;
  createdAt: string;
}

export interface Generation {
  id: string;
  characterId: string;
  sceneTemplateId: string;
  finalPrompt: string;
  imageUrls: string[];
  selectedImageUrl: string | null;
  status: GenerationStatus;
  mode: StyleMode;
  sensualPoseBias: SensualPoseBias | null;
  shotType: ShotType;
  qualityTags: QualityTag[];
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: string;
}

export interface Post {
  id: string;
  characterId: string;
  generationId: string;
  platform: Platform;
  caption: string;
  captionOptions: string[];
  status: PostStatus;
  publishError: string | null;
  scheduledAt: string | null;
  publishedAt: string | null;
  externalPostId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  totalCharacters: number;
  totalGeneratedImages: number;
  totalDraftedPosts: number;
  totalPublishedPosts: number;
  totalVideoClips: number;
}

export interface DashboardPayload {
  metrics: DashboardMetrics;
  recentGenerations: Array<Generation & { characterName: string; sceneTitle: string }>;
  recentPosts: Array<Post & { characterName: string; imageUrl: string | null }>;
  recentVideoClips: Array<
    VideoClipDraft & { characterName: string; sceneTitle: string; sourcePostId: string | null }
  >;
  weeklyPlan: WeeklyPlanItem[];
}

export interface GenerationHistoryItem extends Generation {
  characterName: string;
  sceneTitle: string;
  previewImageUrl: string | null;
  linkedPostId: string | null;
  linkedPostStatus: PostStatus | null;
}

export interface CharacterInput {
  name: string;
  displayName: string;
  ageRange: string;
  identityStyle: string;
  city: string;
  bio: string;
  vibe: string;
  appearanceDescription: string;
  masterReferenceImageUrl: string;
  stylePrompt: string;
  negativePrompt: string;
  postingTone: PostingTone;
  isActive: boolean;
}

export interface GenerateImageInput {
  characterId: string;
  sceneTemplateId: string;
  customPrompt?: string;
  imageCount: number;
  mode?: StyleMode;
  sensualPoseBias?: SensualPoseBias;
}

export interface WeeklyPlanItem {
  dayLabel: string;
  mode: StyleMode;
  sceneId: string;
  sceneTitle: string;
  reason: string;
}

export interface CaptionInput {
  characterId: string;
  generationId: string;
  platform: Platform;
  tone?: PostingTone;
}

export interface PublishInput {
  postId: string;
  platform: Platform;
}

export interface CaptionGenerationResult {
  options: string[];
  provider: "mock" | "openai";
  prompt: string;
}

export interface PublishPlatformResult {
  ok: boolean;
  platform: Exclude<Platform, "both">;
  externalPostId: string | null;
  error: string | null;
}

export interface PublishResult {
  ok: boolean;
  platform: Platform;
  externalPostId: string | null;
  error: string | null;
  results: PublishPlatformResult[];
}

export interface MetaConnectionTestResult {
  ok: boolean;
  platform: Exclude<Platform, "both">;
  mode: "live" | "mock";
  message: string;
  details: {
    pageId?: string;
    pageName?: string | null;
    tokenScopeCount?: number;
  };
}

export type ContentBucket = "selfie" | "lifestyle" | "travel" | "gym" | "sexy";
export type VideoClipStatus = "draft" | "archived";

export interface VideoClipDraft {
  id: string;
  generationId: string;
  characterId: string;
  sceneTemplateId: string;
  sourceImageUrl: string;
  videoUrl: string;
  thumbnailUrl: string;
  motionPresetId: string;
  motionLabel: string;
  motionPrompt: string;
  durationSeconds: number;
  status: VideoClipStatus;
  createdAt: string;
}
