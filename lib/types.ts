export type Platform = "facebook" | "instagram" | "both";
export type PostStatus = "draft" | "queued" | "published" | "failed";
export type GenerationStatus = "draft" | "completed" | "approved" | "failed";
export type RiskLevel = "safe" | "suggestive" | "restricted";
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
}

export interface DashboardPayload {
  metrics: DashboardMetrics;
  recentGenerations: Array<Generation & { characterName: string; sceneTitle: string }>;
  recentPosts: Array<Post & { characterName: string; imageUrl: string | null }>;
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
