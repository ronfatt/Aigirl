import postgres, { Sql } from "postgres";
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
import { generateCaptionOptions } from "@/lib/caption-generator";
import { makeId } from "@/lib/utils";
import { publishContent } from "@/lib/meta-publisher";

type DatabaseState = {
  characters: Character[];
  generations: Generation[];
  posts: Post[];
};

type DbCharacterRow = Omit<Character, "isActive"> & {
  is_active: boolean;
};

type DbGenerationRow = Omit<Generation, "characterId" | "sceneTemplateId" | "imageUrls" | "selectedImageUrl" | "createdAt"> & {
  character_id: string;
  scene_template_id: string;
  image_urls: string[];
  selected_image_url: string | null;
  created_at: string | Date;
};

type DbPostRow = Omit<
  Post,
  | "characterId"
  | "generationId"
  | "captionOptions"
  | "publishError"
  | "scheduledAt"
  | "publishedAt"
  | "externalPostId"
  | "createdAt"
  | "updatedAt"
> & {
  character_id: string;
  generation_id: string;
  caption_options: string[];
  publish_error: string | null;
  scheduled_at: string | Date | null;
  published_at: string | Date | null;
  external_post_id: string | null;
  created_at: string | Date;
  updated_at: string | Date;
};

declare global {
  // eslint-disable-next-line no-var
  var __aiPersonaDb: DatabaseState | undefined;
  // eslint-disable-next-line no-var
  var __aiPersonaSql: Sql | undefined;
  // eslint-disable-next-line no-var
  var __aiPersonaDbInit: Promise<void> | undefined;
}

const now = () => new Date().toISOString();
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
const READ_TIMEOUT_MS = 2500;

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
        captionOptions: [
          "Slow mornings make everything feel lighter.",
          "Keeping the day simple and the light soft.",
          "A little calm before the city gets loud.",
        ],
        status: "draft",
        publishError: null,
        scheduledAt: null,
        publishedAt: null,
        externalPostId: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
  };
}

function getMemoryState() {
  if (!globalThis.__aiPersonaDb) {
    globalThis.__aiPersonaDb = createSeedState();
  }

  return globalThis.__aiPersonaDb;
}

function timeoutError(label: string) {
  return new Error(`${label} timed out after ${READ_TIMEOUT_MS}ms.`);
}

async function withReadFallback<T>(label: string, read: () => Promise<T>, fallback: () => T) {
  if (!hasDatabaseUrl) {
    return fallback();
  }

  try {
    return await Promise.race([
      read(),
      new Promise<T>((_, reject) => {
        setTimeout(() => reject(timeoutError(label)), READ_TIMEOUT_MS);
      }),
    ]);
  } catch (error) {
    console.error(`${label} failed, using fallback data.`, error);
    return fallback();
  }
}

function normalizeDate(value: string | Date | null | undefined) {
  if (!value) {
    return null;
  }

  return new Date(value).toISOString();
}

function mapCharacterRow(row: DbCharacterRow): Character {
  return {
    id: row.id,
    name: row.name,
    displayName: row.displayName,
    ageRange: row.ageRange,
    identityStyle: row.identityStyle,
    city: row.city,
    bio: row.bio,
    vibe: row.vibe,
    appearanceDescription: row.appearanceDescription,
    masterReferenceImageUrl: row.masterReferenceImageUrl,
    stylePrompt: row.stylePrompt,
    negativePrompt: row.negativePrompt,
    postingTone: row.postingTone,
    isActive: row.is_active,
    createdAt: normalizeDate(row.createdAt)!,
    updatedAt: normalizeDate(row.updatedAt)!,
  };
}

function mapGenerationRow(row: DbGenerationRow): Generation {
  return {
    id: row.id,
    characterId: row.character_id,
    sceneTemplateId: row.scene_template_id,
    finalPrompt: row.finalPrompt,
    imageUrls: Array.isArray(row.image_urls) ? row.image_urls : [],
    selectedImageUrl: row.selected_image_url,
    status: row.status,
    createdAt: normalizeDate(row.created_at)!,
  };
}

function mapPostRow(row: DbPostRow): Post {
  return {
    id: row.id,
    characterId: row.character_id,
    generationId: row.generation_id,
    platform: row.platform,
    caption: row.caption,
    captionOptions: Array.isArray(row.caption_options) ? row.caption_options : [],
    status: row.status,
    publishError: row.publish_error,
    scheduledAt: normalizeDate(row.scheduled_at),
    publishedAt: normalizeDate(row.published_at),
    externalPostId: row.external_post_id,
    createdAt: normalizeDate(row.created_at)!,
    updatedAt: normalizeDate(row.updated_at)!,
  };
}

function getSql() {
  if (!hasDatabaseUrl) {
    return null;
  }

  if (!globalThis.__aiPersonaSql) {
    globalThis.__aiPersonaSql = postgres(process.env.DATABASE_URL!, {
      prepare: false,
      max: 1,
    });
  }

  return globalThis.__aiPersonaSql;
}

function requireSql() {
  const sql = getSql();

  if (!sql) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return sql;
}

function shouldBootstrapAfterError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const code = "code" in error ? String(error.code) : "";

  // Undefined table / relation / column errors are safe to retry after bootstrap.
  return code === "42P01" || code === "42703";
}

async function withBootstrapOnMissingSchema<T>(query: () => Promise<T>) {
  try {
    return await query();
  } catch (error) {
    if (!shouldBootstrapAfterError(error)) {
      throw error;
    }

    await ensureDatabaseReady();
    return query();
  }
}

async function ensureDatabaseReady() {
  const sql = getSql();

  if (!sql) {
    return;
  }

  if (!globalThis.__aiPersonaDbInit) {
    globalThis.__aiPersonaDbInit = (async () => {
      await sql`
        create table if not exists scene_templates (
          id text primary key,
          title text not null,
          category text not null,
          prompt_template text not null,
          caption_hint text not null,
          risk_level text not null,
          created_at timestamptz not null default now()
        )
      `;

      await sql`
        create table if not exists characters (
          id text primary key,
          name text not null,
          display_name text not null,
          age_range text not null,
          identity_style text not null,
          city text not null,
          bio text not null,
          vibe text not null,
          appearance_description text not null,
          master_reference_image_url text not null,
          style_prompt text not null,
          negative_prompt text not null,
          posting_tone text not null,
          is_active boolean not null default true,
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now()
        )
      `;

      await sql`
        create table if not exists generations (
          id text primary key,
          character_id text not null references characters(id) on delete cascade,
          scene_template_id text not null references scene_templates(id),
          final_prompt text not null,
          image_urls jsonb not null default '[]'::jsonb,
          selected_image_url text,
          status text not null,
          created_at timestamptz not null default now()
        )
      `;

      await sql`
        create table if not exists posts (
          id text primary key,
          character_id text not null references characters(id) on delete cascade,
          generation_id text not null references generations(id) on delete cascade,
          platform text not null,
          caption text not null,
          caption_options jsonb not null default '[]'::jsonb,
          status text not null,
          publish_error text,
          scheduled_at timestamptz,
          published_at timestamptz,
          external_post_id text,
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now()
        )
      `;

      for (const scene of sceneLibrary) {
        await sql`
          insert into scene_templates (
            id,
            title,
            category,
            prompt_template,
            caption_hint,
            risk_level,
            created_at
          ) values (
            ${scene.id},
            ${scene.title},
            ${scene.category},
            ${scene.promptTemplate},
            ${scene.captionHint},
            ${scene.riskLevel},
            ${scene.createdAt}
          )
          on conflict (id) do update set
            title = excluded.title,
            category = excluded.category,
            prompt_template = excluded.prompt_template,
            caption_hint = excluded.caption_hint,
            risk_level = excluded.risk_level
        `;
      }
    })();
  }

  await globalThis.__aiPersonaDbInit;
}

async function listCharactersFromDb() {
  const sql = requireSql();
  const rows = await withBootstrapOnMissingSchema(() =>
    sql<DbCharacterRow[]>`
      select
        id,
        name,
        display_name as "displayName",
        age_range as "ageRange",
        identity_style as "identityStyle",
        city,
        bio,
        vibe,
        appearance_description as "appearanceDescription",
        master_reference_image_url as "masterReferenceImageUrl",
        style_prompt as "stylePrompt",
        negative_prompt as "negativePrompt",
        posting_tone as "postingTone",
        is_active,
        created_at as "createdAt",
        updated_at as "updatedAt"
      from characters
      order by updated_at desc
    `,
  );

  return rows.map(mapCharacterRow);
}

async function getCharacterFromDb(id: string) {
  const sql = requireSql();
  const rows = await withBootstrapOnMissingSchema(() =>
    sql<DbCharacterRow[]>`
      select
        id,
        name,
        display_name as "displayName",
        age_range as "ageRange",
        identity_style as "identityStyle",
        city,
        bio,
        vibe,
        appearance_description as "appearanceDescription",
        master_reference_image_url as "masterReferenceImageUrl",
        style_prompt as "stylePrompt",
        negative_prompt as "negativePrompt",
        posting_tone as "postingTone",
        is_active,
        created_at as "createdAt",
        updated_at as "updatedAt"
      from characters
      where id = ${id}
      limit 1
    `,
  );

  return rows[0] ? mapCharacterRow(rows[0]) : null;
}

async function listPostsFromDb() {
  const sql = requireSql();
  const rows = await withBootstrapOnMissingSchema(() =>
    sql<DbPostRow[]>`
      select
        id,
        character_id,
        generation_id,
        platform,
        caption,
        caption_options,
        status,
        publish_error,
        scheduled_at,
        published_at,
        external_post_id,
        created_at,
        updated_at
      from posts
      order by updated_at desc
    `,
  );

  return rows.map(mapPostRow);
}

async function listGenerationsFromDb() {
  const sql = requireSql();
  const rows = await withBootstrapOnMissingSchema(() =>
    sql<DbGenerationRow[]>`
      select
        id,
        character_id,
        scene_template_id,
        final_prompt as "finalPrompt",
        image_urls,
        selected_image_url,
        status,
        created_at
      from generations
      order by created_at desc
    `,
  );

  return rows.map(mapGenerationRow);
}

export async function listCharacters() {
  return withReadFallback("listCharacters", () => listCharactersFromDb(), () => getMemoryState().characters);
}

export async function getCharacter(id: string) {
  return withReadFallback(
    "getCharacter",
    () => getCharacterFromDb(id),
    () => getMemoryState().characters.find((character) => character.id === id) ?? null,
  );
}

export async function createCharacter(input: CharacterInput) {
  if (!hasDatabaseUrl) {
    const entry: Character = {
      id: makeId("char"),
      ...input,
      createdAt: now(),
      updatedAt: now(),
    };

    getMemoryState().characters.unshift(entry);
    return entry;
  }

  const sql = requireSql();
  await ensureDatabaseReady();
  const id = makeId("char");
  const rows = await sql<DbCharacterRow[]>`
    insert into characters (
      id,
      name,
      display_name,
      age_range,
      identity_style,
      city,
      bio,
      vibe,
      appearance_description,
      master_reference_image_url,
      style_prompt,
      negative_prompt,
      posting_tone,
      is_active
    ) values (
      ${id},
      ${input.name},
      ${input.displayName},
      ${input.ageRange},
      ${input.identityStyle},
      ${input.city},
      ${input.bio},
      ${input.vibe},
      ${input.appearanceDescription},
      ${input.masterReferenceImageUrl},
      ${input.stylePrompt},
      ${input.negativePrompt},
      ${input.postingTone},
      ${input.isActive}
    )
    returning
      id,
      name,
      display_name as "displayName",
      age_range as "ageRange",
      identity_style as "identityStyle",
      city,
      bio,
      vibe,
      appearance_description as "appearanceDescription",
      master_reference_image_url as "masterReferenceImageUrl",
      style_prompt as "stylePrompt",
      negative_prompt as "negativePrompt",
      posting_tone as "postingTone",
      is_active,
      created_at as "createdAt",
      updated_at as "updatedAt"
  `;

  return mapCharacterRow(rows[0]);
}

export async function updateCharacter(id: string, input: Partial<CharacterInput>) {
  if (!hasDatabaseUrl) {
    const state = getMemoryState();
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

  const existing = await getCharacter(id);

  if (!existing) {
    return null;
  }

  const next: Character = {
    ...existing,
    ...input,
    updatedAt: now(),
  };
  const sql = requireSql();
  await ensureDatabaseReady();
  const rows = await sql<DbCharacterRow[]>`
    update characters set
      name = ${next.name},
      display_name = ${next.displayName},
      age_range = ${next.ageRange},
      identity_style = ${next.identityStyle},
      city = ${next.city},
      bio = ${next.bio},
      vibe = ${next.vibe},
      appearance_description = ${next.appearanceDescription},
      master_reference_image_url = ${next.masterReferenceImageUrl},
      style_prompt = ${next.stylePrompt},
      negative_prompt = ${next.negativePrompt},
      posting_tone = ${next.postingTone},
      is_active = ${next.isActive},
      updated_at = ${next.updatedAt}
    where id = ${id}
    returning
      id,
      name,
      display_name as "displayName",
      age_range as "ageRange",
      identity_style as "identityStyle",
      city,
      bio,
      vibe,
      appearance_description as "appearanceDescription",
      master_reference_image_url as "masterReferenceImageUrl",
      style_prompt as "stylePrompt",
      negative_prompt as "negativePrompt",
      posting_tone as "postingTone",
      is_active,
      created_at as "createdAt",
      updated_at as "updatedAt"
  `;

  return mapCharacterRow(rows[0]);
}

export async function listPosts() {
  return withReadFallback("listPosts", () => listPostsFromDb(), () => getMemoryState().posts);
}

export async function updatePost(
  id: string,
  input: Partial<Pick<Post, "caption" | "platform" | "status" | "scheduledAt">>,
) {
  if (!hasDatabaseUrl) {
    const state = getMemoryState();
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

  const existing = (await listPostsFromDb()).find((post) => post.id === id);

  if (!existing) {
    return null;
  }

  const next: Post = {
    ...existing,
    ...input,
    updatedAt: now(),
  };

  const sql = requireSql();
  await ensureDatabaseReady();
  const rows = await sql<DbPostRow[]>`
    update posts set
      caption = ${next.caption},
      platform = ${next.platform},
      status = ${next.status},
      scheduled_at = ${next.scheduledAt},
      updated_at = ${next.updatedAt}
    where id = ${id}
    returning
      id,
      character_id,
      generation_id,
      platform,
      caption,
      caption_options,
      status,
      publish_error,
      scheduled_at,
      published_at,
      external_post_id,
      created_at,
      updated_at
  `;

  return rows[0] ? mapPostRow(rows[0]) : null;
}

async function insertGenerationRecord(input: {
  id: string;
  characterId: string;
  sceneTemplateId: string;
  finalPrompt: string;
  imageUrls: string[];
}) {
  const sql = requireSql();
  await ensureDatabaseReady();
  const rows = await sql<DbGenerationRow[]>`
    insert into generations (
      id,
      character_id,
      scene_template_id,
      final_prompt,
      image_urls,
      selected_image_url,
      status
    ) values (
      ${input.id},
      ${input.characterId},
      ${input.sceneTemplateId},
      ${input.finalPrompt},
      ${sql.json(input.imageUrls)},
      ${null},
      ${"completed"}
    )
    returning
      id,
      character_id,
      scene_template_id,
      final_prompt as "finalPrompt",
      image_urls,
      selected_image_url,
      status,
      created_at
  `;

  return mapGenerationRow(rows[0]);
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

  if (!hasDatabaseUrl) {
    const generation: Generation = {
      id: makeId("gen"),
      characterId: character.id,
      sceneTemplateId: scene.id,
      finalPrompt,
      imageUrls,
      selectedImageUrl: null,
      status: "completed",
      createdAt: now(),
    };

    getMemoryState().generations.unshift(generation);
    return { generation };
  }

  const generation = await insertGenerationRecord({
    id: makeId("gen"),
    characterId: character.id,
    sceneTemplateId: scene.id,
    finalPrompt,
    imageUrls,
  });

  return { generation };
}

export async function createCaption(input: CaptionInput) {
  const character = await getCharacter(input.characterId);
  const generation = hasDatabaseUrl
    ? (await listGenerationsFromDb()).find((item) => item.id === input.generationId)
    : getMemoryState().generations.find((item) => item.id === input.generationId);
  const scene = sceneLibrary.find((item) => item.id === generation?.sceneTemplateId);

  if (!character || !generation || !scene) {
    throw new Error("Caption context not found.");
  }

  return generateCaptionOptions({
    character,
    scene,
    tone: input.tone,
  });
}

export async function selectGenerationImage(generationId: string, imageUrl: string) {
  if (!hasDatabaseUrl) {
    const state = getMemoryState();
    const generation = state.generations.find((item) => item.id === generationId);

    if (!generation) {
      return null;
    }

    const existingPost = state.posts.find((item) => item.generationId === generation.id) ?? null;
    const character = state.characters.find((item) => item.id === generation.characterId) ?? null;
    const scene = sceneLibrary.find((item) => item.id === generation.sceneTemplateId) ?? null;

    generation.selectedImageUrl = imageUrl;
    generation.status = "approved";

    if (existingPost) {
      return { generation, draftPost: existingPost };
    }

    if (!character || !scene) {
      throw new Error("Unable to create draft post for this generation.");
    }

    const captionResult = await generateCaptionOptions({
      character,
      scene,
    });

    const draftPost: Post = {
      id: makeId("post"),
      characterId: character.id,
      generationId: generation.id,
      platform: "instagram",
      caption: captionResult.options[0] ?? "",
      captionOptions: captionResult.options,
      status: "draft",
      publishError: null,
      scheduledAt: null,
      publishedAt: null,
      externalPostId: null,
      createdAt: now(),
      updatedAt: now(),
    };

    state.posts.unshift(draftPost);

    return { generation, draftPost };
  }

  const sql = requireSql();
  await ensureDatabaseReady();

  const generationRows = await sql<DbGenerationRow[]>`
    update generations
    set selected_image_url = ${imageUrl}, status = ${"approved"}
    where id = ${generationId}
    returning
      id,
      character_id,
      scene_template_id,
      final_prompt as "finalPrompt",
      image_urls,
      selected_image_url,
      status,
      created_at
  `;

  const generation = generationRows[0] ? mapGenerationRow(generationRows[0]) : null;

  if (!generation) {
    return null;
  }

  const postRows = await sql<DbPostRow[]>`
    select
      id,
      character_id,
      generation_id,
      platform,
      caption,
      caption_options,
      status,
      publish_error,
      scheduled_at,
      published_at,
      external_post_id,
      created_at,
      updated_at
    from posts
    where generation_id = ${generation.id}
    limit 1
  `;

  if (postRows[0]) {
    return {
      generation,
      draftPost: mapPostRow(postRows[0]),
    };
  }

  const character = await getCharacter(generation.characterId);
  const scene = sceneLibrary.find((item) => item.id === generation.sceneTemplateId);

  if (!character || !scene) {
    throw new Error("Unable to create draft post for this generation.");
  }

  const captionResult = await generateCaptionOptions({
    character,
    scene,
  });

  const insertedRows = await sql<DbPostRow[]>`
    insert into posts (
      id,
      character_id,
      generation_id,
      platform,
      caption,
      caption_options,
      status,
      publish_error,
      scheduled_at,
      published_at,
      external_post_id,
      created_at,
      updated_at
    ) values (
      ${makeId("post")},
      ${character.id},
      ${generation.id},
      ${"instagram"},
      ${captionResult.options[0] ?? ""},
      ${sql.json(captionResult.options)},
      ${"draft"},
      ${null},
      ${null},
      ${null},
      ${null},
      ${now()},
      ${now()}
    )
    returning
      id,
      character_id,
      generation_id,
      platform,
      caption,
      caption_options,
      status,
      publish_error,
      scheduled_at,
      published_at,
      external_post_id,
      created_at,
      updated_at
  `;

  return {
    generation,
    draftPost: mapPostRow(insertedRows[0]),
  };
}

export async function publishPost(postId: string, platform?: Platform) {
  if (!hasDatabaseUrl) {
    const state = getMemoryState();
    const index = state.posts.findIndex((item) => item.id === postId);

    if (index === -1) {
      throw new Error("Post not found.");
    }

    const post = state.posts[index];
    const target = platform ?? post.platform;
    const generation = state.generations.find((item) => item.id === post.generationId);
    const imageUrl = generation?.selectedImageUrl;

    if (!imageUrl) {
      state.posts[index] = {
        ...post,
        platform: target,
        status: "failed",
        publishError: "No approved image selected for this post.",
        externalPostId: null,
        publishedAt: null,
        updatedAt: now(),
      };

      return {
        post: state.posts[index],
        result: {
          ok: false,
          platform: target,
          externalPostId: null,
          error: "No approved image selected for this post.",
          results: [],
        },
      };
    }

    const result = await publishContent({
      platform: target,
      imageUrl,
      caption: post.caption,
    });
    const nextStatus: PostStatus = result.ok ? "published" : "failed";

    state.posts[index] = {
      ...post,
      platform: target,
      status: nextStatus,
      publishError: result.error,
      externalPostId: result.externalPostId,
      publishedAt: result.ok ? now() : null,
      updatedAt: now(),
    };

    return {
      post: state.posts[index],
      result,
    };
  }

  const sql = requireSql();
  await ensureDatabaseReady();
  const rows = await sql<DbPostRow[]>`
    select
      id,
      character_id,
      generation_id,
      platform,
      caption,
      caption_options,
      status,
      publish_error,
      scheduled_at,
      published_at,
      external_post_id,
      created_at,
      updated_at
    from posts
    where id = ${postId}
    limit 1
  `;

  const post = rows[0] ? mapPostRow(rows[0]) : null;

  if (!post) {
    throw new Error("Post not found.");
  }

  const target = platform ?? post.platform;
  const generationRows = await sql<DbGenerationRow[]>`
    select
      id,
      character_id,
      scene_template_id,
      final_prompt as "finalPrompt",
      image_urls,
      selected_image_url,
      status,
      created_at
    from generations
    where id = ${post.generationId}
    limit 1
  `;
  const generation = generationRows[0] ? mapGenerationRow(generationRows[0]) : null;
  const imageUrl = generation?.selectedImageUrl;

  if (!imageUrl) {
    const updatedRows = await sql<DbPostRow[]>`
      update posts set
        platform = ${target},
        status = ${"failed"},
        publish_error = ${"No approved image selected for this post."},
        external_post_id = ${null},
        published_at = ${null},
        updated_at = ${now()}
      where id = ${postId}
      returning
        id,
        character_id,
        generation_id,
        platform,
        caption,
        caption_options,
        status,
        publish_error,
        scheduled_at,
        published_at,
        external_post_id,
        created_at,
        updated_at
    `;

    return {
      post: mapPostRow(updatedRows[0]),
      result: {
        ok: false,
        platform: target,
        externalPostId: null,
        error: "No approved image selected for this post.",
        results: [],
      },
    };
  }

  const result = await publishContent({
    platform: target,
    imageUrl,
    caption: post.caption,
  });
  const nextStatus: PostStatus = result.ok ? "published" : "failed";

  const updatedRows = await sql<DbPostRow[]>`
    update posts set
      platform = ${target},
      status = ${nextStatus},
      publish_error = ${result.error},
      external_post_id = ${result.externalPostId},
      published_at = ${result.ok ? now() : null},
      updated_at = ${now()}
    where id = ${postId}
    returning
      id,
      character_id,
      generation_id,
      platform,
      caption,
      caption_options,
      status,
      publish_error,
      scheduled_at,
      published_at,
      external_post_id,
      created_at,
      updated_at
  `;

  return {
    post: mapPostRow(updatedRows[0]),
    result,
  };
}

export async function getDashboardData(): Promise<DashboardPayload> {
  const buildPayload = (state: DatabaseState) => ({
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
  });

  if (!hasDatabaseUrl) {
    return buildPayload(getMemoryState());
  }

  const snapshot = await withReadFallback(
    "getDashboardData",
    async () => {
      const [characters, generations, posts] = await Promise.all([
        listCharactersFromDb(),
        listGenerationsFromDb(),
        listPostsFromDb(),
      ]);

      return { characters, generations, posts };
    },
    () => getMemoryState(),
  );

  return {
    metrics: {
      totalCharacters: snapshot.characters.length,
      totalGeneratedImages: snapshot.generations.reduce(
        (total, generation) => total + generation.imageUrls.length,
        0,
      ),
      totalDraftedPosts: snapshot.posts.filter((post) => post.status === "draft").length,
      totalPublishedPosts: snapshot.posts.filter((post) => post.status === "published").length,
    },
    recentGenerations: snapshot.generations.slice(0, 5).map((generation) => {
      const characterName =
        snapshot.characters.find((item) => item.id === generation.characterId)?.displayName ?? "Unknown";
      const sceneTitle =
        sceneLibrary.find((item) => item.id === generation.sceneTemplateId)?.title ?? "Scene";

      return {
        ...generation,
        characterName,
        sceneTitle,
      };
    }),
    recentPosts: snapshot.posts.slice(0, 5).map((post) => {
      const characterName =
        snapshot.characters.find((item) => item.id === post.characterId)?.displayName ?? "Unknown";
      const imageUrl =
        snapshot.generations.find((item) => item.id === post.generationId)?.selectedImageUrl ?? null;

      return {
        ...post,
        characterName,
        imageUrl,
      };
    }),
  };
}

export async function getDatabaseSnapshot() {
  return withReadFallback(
    "getDatabaseSnapshot",
    async () => {
      const [characters, generations, posts] = await Promise.all([
        listCharactersFromDb(),
        listGenerationsFromDb(),
        listPostsFromDb(),
      ]);

      return {
        characters,
        generations,
        posts,
      };
    },
    () => getMemoryState(),
  );
}
