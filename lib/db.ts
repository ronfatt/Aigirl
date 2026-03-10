import {
  CaptionInput,
  Character,
  CharacterInput,
  DashboardPayload,
  GenerateImageInput,
  Generation,
  Platform,
  Post,
  PostStatus,
} from "@/lib/types";
import { sceneLibrary } from "@/lib/scene-library";
import { composeImagePrompt } from "@/lib/prompts";
import { generatePersonaImages } from "@/lib/image-generator";
import { generateCaption } from "@/lib/caption-generator";
import { makeId } from "@/lib/utils";
import {
  publishToBoth,
  publishToFacebook,
  publishToInstagram,
} from "@/lib/meta-publisher";

type DatabaseState = {
  characters: Character[];
  generations: Generation[];
  posts: Post[];
};

declare global {
  // eslint-disable-next-line no-var
  var __aiPersonaDb: DatabaseState | undefined;
}

const now = () => new Date().toISOString();

function createSeedState(): DatabaseState {
  const timestamp = now();
  const characterId = "char_stella";
  const generationId = "gen_seed";

  return {
    characters: [
      {
        id: characterId,
        name: "stella-ray",
        displayName: "Stella Ray",
        ageRange: "24-28",
        identityStyle: "modern Mediterranean lifestyle creator",
        city: "Barcelona",
        bio: "A polished city-to-coast persona sharing slow luxury and soft routines.",
        vibe: "warm, grounded, quietly confident",
        appearanceDescription:
          "natural brunette waves, expressive eyes, sun-kissed skin, refined casual styling",
        masterReferenceImageUrl:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
        stylePrompt:
          "editorial natural light, premium lifestyle photography, realistic skin texture, subtle depth of field",
        negativePrompt:
          "explicit nudity, extra limbs, warped face, low-resolution, heavy retouching, unsafe content",
        postingTone: "soft lifestyle",
        isActive: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    generations: [
      {
        id: generationId,
        characterId,
        sceneTemplateId: "cafe-window",
        finalPrompt: "Seed prompt",
        imageUrls: [
          "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=900&q=80",
        ],
        selectedImageUrl:
          "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=900&q=80",
        status: "approved",
        createdAt: timestamp,
      },
    ],
    posts: [
      {
        id: "post_seed",
        characterId,
        generationId,
        platform: "instagram",
        caption: "Slow mornings make everything feel lighter.",
        status: "draft",
        scheduledAt: null,
        publishedAt: null,
        externalPostId: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
  };
}

function getState() {
  if (!globalThis.__aiPersonaDb) {
    globalThis.__aiPersonaDb = createSeedState();
  }

  return globalThis.__aiPersonaDb;
}

export async function listCharacters() {
  return getState().characters;
}

export async function getCharacter(id: string) {
  return getState().characters.find((character) => character.id === id) ?? null;
}

export async function createCharacter(input: CharacterInput) {
  const entry: Character = {
    id: makeId("char"),
    ...input,
    createdAt: now(),
    updatedAt: now(),
  };

  getState().characters.unshift(entry);
  return entry;
}

export async function updateCharacter(id: string, input: Partial<CharacterInput>) {
  const state = getState();
  const index = state.characters.findIndex((character) => character.id === id);

  if (index === -1) {
    return null;
  }

  state.characters[index] = {
    ...state.characters[index],
    ...input,
    updatedAt: now(),
  };

  return state.characters[index];
}

export async function listPosts() {
  return getState().posts;
}

export async function updatePost(
  id: string,
  input: Partial<Pick<Post, "caption" | "platform" | "status" | "scheduledAt">>,
) {
  const state = getState();
  const index = state.posts.findIndex((post) => post.id === id);

  if (index === -1) {
    return null;
  }

  state.posts[index] = {
    ...state.posts[index],
    ...input,
    updatedAt: now(),
  };

  return state.posts[index];
}

export async function createGeneration(input: GenerateImageInput) {
  const character = await getCharacter(input.characterId);
  const scene = sceneLibrary.find((item) => item.id === input.sceneTemplateId);

  if (!character || !scene) {
    throw new Error("Character or scene template not found.");
  }

  const finalPrompt = composeImagePrompt({
    character,
    scene,
    customPrompt: input.customPrompt,
  });
  const imageUrls = await generatePersonaImages({
    prompt: finalPrompt,
    imageCount: input.imageCount,
    referenceImageUrl: character.masterReferenceImageUrl,
  });

  const generation: Generation = {
    id: makeId("gen"),
    characterId: character.id,
    sceneTemplateId: scene.id,
    finalPrompt,
    imageUrls,
    selectedImageUrl: imageUrls[0] ?? null,
    status: "completed",
    createdAt: now(),
  };

  getState().generations.unshift(generation);

  const captionResult = await generateCaption({
    character,
    scene,
  });

  const draftPost: Post = {
    id: makeId("post"),
    characterId: character.id,
    generationId: generation.id,
    platform: "instagram",
    caption: captionResult.caption,
    status: "draft",
    scheduledAt: null,
    publishedAt: null,
    externalPostId: null,
    createdAt: now(),
    updatedAt: now(),
  };

  getState().posts.unshift(draftPost);

  return {
    generation,
    draftPost,
    captionResult,
  };
}

export async function createCaption(input: CaptionInput) {
  const state = getState();
  const character = state.characters.find((item) => item.id === input.characterId);
  const generation = state.generations.find((item) => item.id === input.generationId);
  const scene = sceneLibrary.find((item) => item.id === generation?.sceneTemplateId);

  if (!character || !generation || !scene) {
    throw new Error("Caption context not found.");
  }

  return generateCaption({
    character,
    scene,
    tone: input.tone,
  });
}

export async function selectGenerationImage(generationId: string, imageUrl: string) {
  const state = getState();
  const generation = state.generations.find((item) => item.id === generationId);

  if (!generation) {
    return null;
  }

  generation.selectedImageUrl = imageUrl;
  generation.status = "approved";
  return generation;
}

export async function publishPost(postId: string, platform?: Platform) {
  const state = getState();
  const index = state.posts.findIndex((item) => item.id === postId);

  if (index === -1) {
    throw new Error("Post not found.");
  }

  const post = state.posts[index];
  const target = platform ?? post.platform;

  const result =
    target === "instagram"
      ? await publishToInstagram(post)
      : target === "facebook"
        ? await publishToFacebook(post)
        : await publishToBoth(post);

  const nextStatus: PostStatus = result.ok ? "published" : "failed";

  state.posts[index] = {
    ...post,
    platform: target,
    status: nextStatus,
    externalPostId: result.externalPostId,
    publishedAt: result.ok ? now() : null,
    updatedAt: now(),
  };

  return {
    post: state.posts[index],
    result,
  };
}

export async function getDashboardData(): Promise<DashboardPayload> {
  const state = getState();

  return {
    metrics: {
      totalCharacters: state.characters.length,
      totalGeneratedImages: state.generations.reduce(
        (total, generation) => total + generation.imageUrls.length,
        0,
      ),
      totalDraftedPosts: state.posts.filter((post) => post.status === "draft").length,
      totalPublishedPosts: state.posts.filter((post) => post.status === "published").length,
    },
    recentGenerations: state.generations.slice(0, 5).map((generation) => {
      const characterName =
        state.characters.find((item) => item.id === generation.characterId)?.displayName ??
        "Unknown";
      const sceneTitle =
        sceneLibrary.find((item) => item.id === generation.sceneTemplateId)?.title ?? "Scene";
      return {
        ...generation,
        characterName,
        sceneTitle,
      };
    }),
    recentPosts: state.posts.slice(0, 5).map((post) => {
      const characterName =
        state.characters.find((item) => item.id === post.characterId)?.displayName ?? "Unknown";
      const imageUrl =
        state.generations.find((item) => item.id === post.generationId)?.selectedImageUrl ?? null;
      return {
        ...post,
        characterName,
        imageUrl,
      };
    }),
  };
}

export async function getDatabaseSnapshot() {
  return getState();
}

// Replace the in-memory store above with a real Postgres/Supabase adapter:
// - use DATABASE_URL for sql clients or Supabase server client
// - move CRUD functions to repository modules
// - keep route handlers unchanged
