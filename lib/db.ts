import postgres, { Sql } from "postgres";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
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
  QualityTag,
  SceneTemplate,
  SensualPoseBias,
  ShotType,
  StyleMode,
  IdentityLockStrength,
  LookProfile,
  VideoClipDraft,
  VideoClipStatus,
} from "@/lib/types";
import { sceneLibrary } from "@/lib/scene-library";
import { buildWeeklyPlan } from "@/lib/content-strategy";
import { getIdentityRiskScore } from "@/lib/identity-review";
import { composeImagePrompt } from "@/lib/prompts";
import { generatePersonaImages } from "@/lib/image-generator";
import { generateCaptionOptions } from "@/lib/caption-generator";
import { makeId } from "@/lib/utils";
import { publishContent } from "@/lib/meta-publisher";

type DatabaseState = {
  characters: Character[];
  generations: Generation[];
  posts: Post[];
  videoClips: VideoClipDraft[];
};

type DbCharacterRow = {
  id: string;
  name: string;
  displayName?: string;
  display_name?: string;
  ageRange?: string;
  age_range?: string;
  identityStyle?: string;
  identity_style?: string;
  city: string;
  bio: string;
  vibe: string;
  appearanceDescription?: string;
  appearance_description?: string;
  masterReferenceImageUrl?: string;
  master_reference_image_url?: string;
  faceReferenceImageUrl?: string;
  face_reference_image_url?: string;
  styleReferenceImageUrl?: string;
  style_reference_image_url?: string;
  bodyReferenceImageUrl?: string;
  body_reference_image_url?: string;
  stylePrompt?: string;
  style_prompt?: string;
  negativePrompt?: string;
  negative_prompt?: string;
  postingTone?: string;
  posting_tone?: string;
  identityLockStrength?: IdentityLockStrength;
  identity_lock_strength?: IdentityLockStrength;
  lookProfile?: LookProfile;
  look_profile?: LookProfile;
  is_active: boolean;
  createdAt?: string | Date;
  created_at?: string | Date;
  updatedAt?: string | Date;
  updated_at?: string | Date;
};

type DbGenerationRow = {
  id: string;
  characterId?: string;
  character_id?: string;
  sceneTemplateId?: string;
  scene_template_id?: string;
  finalPrompt?: string;
  final_prompt?: string;
  imageUrls?: string[];
  image_urls?: string[];
  selectedImageUrl?: string | null;
  selected_image_url?: string | null;
  status: Generation["status"];
  mode?: StyleMode;
  sensualPoseBias?: SensualPoseBias | null;
  sensual_pose_bias?: SensualPoseBias | null;
  shotType?: ShotType;
  shot_type?: ShotType;
  qualityTags?: QualityTag[];
  quality_tags?: QualityTag[];
  isFavorite?: boolean;
  is_favorite?: boolean;
  isArchived?: boolean;
  is_archived?: boolean;
  createdAt?: string | Date;
  created_at?: string | Date;
};

type DbPostRow = {
  id: string;
  characterId?: string;
  character_id?: string;
  generationId?: string;
  generation_id?: string;
  platform: Platform;
  caption: string;
  captionOptions?: string[];
  caption_options?: string[];
  status: PostStatus;
  publishError?: string | null;
  publish_error?: string | null;
  scheduledAt?: string | Date | null;
  scheduled_at?: string | Date | null;
  publishedAt?: string | Date | null;
  published_at?: string | Date | null;
  externalPostId?: string | null;
  external_post_id?: string | null;
  createdAt?: string | Date;
  created_at?: string | Date;
  updatedAt?: string | Date;
  updated_at?: string | Date;
};

type DbVideoClipRow = {
  id: string;
  generationId?: string;
  generation_id?: string;
  characterId?: string;
  character_id?: string;
  sceneTemplateId?: string;
  scene_template_id?: string;
  sourceImageUrl?: string;
  source_image_url?: string;
  videoUrl?: string;
  video_url?: string;
  thumbnailUrl?: string;
  thumbnail_url?: string;
  motionPresetId?: string;
  motion_preset_id?: string;
  motionLabel?: string;
  motion_label?: string;
  motionPrompt?: string;
  motion_prompt?: string;
  durationSeconds?: number;
  duration_seconds?: number;
  status: VideoClipStatus;
  createdAt?: string | Date;
  created_at?: string | Date;
};

declare global {
  // eslint-disable-next-line no-var
  var __aiPersonaDb: DatabaseState | undefined;
  // eslint-disable-next-line no-var
  var __aiPersonaSql: Sql | undefined;
  // eslint-disable-next-line no-var
  var __aiPersonaDbInit: Promise<void> | undefined;
  // eslint-disable-next-line no-var
  var __aiPersonaSupabase: SupabaseClient | undefined;
}

const now = () => new Date().toISOString();
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
const hasSupabaseAdmin = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
);
const READ_TIMEOUT_MS = 8000;
const WRITE_TIMEOUT_MS = 12000;
const WORKFLOW_TIMEOUT_MS = 20000;

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
        faceReferenceImageUrl:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
        styleReferenceImageUrl: "",
        bodyReferenceImageUrl: "",
        stylePrompt:
          "editorial natural light, premium lifestyle photography, realistic skin texture, subtle depth of field",
        negativePrompt:
          "explicit nudity, extra limbs, warped face, low-resolution, heavy retouching, unsafe content",
        postingTone: "soft lifestyle",
        identityLockStrength: "balanced",
        lookProfile: "signature",
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
        mode: "lifestyle",
        sensualPoseBias: null,
        shotType: "half-body",
        qualityTags: ["face stable", "framing good", "background clear", "publish-ready"],
        isFavorite: true,
        isArchived: false,
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
    videoClips: [],
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

function writeTimeoutError(label: string) {
  return new Error(`${label} timed out after ${WRITE_TIMEOUT_MS}ms.`);
}

function workflowTimeoutError(label: string) {
  return new Error(`${label} timed out after ${WORKFLOW_TIMEOUT_MS}ms.`);
}

async function withWriteTimeout<T>(label: string, write: () => Promise<T>) {
  return Promise.race([
    write(),
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(writeTimeoutError(label)), WRITE_TIMEOUT_MS);
    }),
  ]);
}

async function withWorkflowTimeout<T>(label: string, work: () => Promise<T>) {
  return Promise.race([
    work(),
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(workflowTimeoutError(label)), WORKFLOW_TIMEOUT_MS);
    }),
  ]);
}

async function withReadTimeout<T>(label: string, read: () => Promise<T>) {
  return Promise.race([
    read(),
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(timeoutError(label)), READ_TIMEOUT_MS);
    }),
  ]);
}

function normalizeDate(value: string | Date | null | undefined) {
  if (!value) {
    return null;
  }

  return new Date(value).toISOString();
}

function getSupabaseDbClient() {
  if (!hasSupabaseAdmin) {
    return null;
  }

  if (!globalThis.__aiPersonaSupabase) {
    globalThis.__aiPersonaSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );
  }

  return globalThis.__aiPersonaSupabase;
}

function mapCharacterRow(row: DbCharacterRow): Character {
  const masterReferenceImageUrl =
    row.masterReferenceImageUrl ?? row.master_reference_image_url ?? "";

  return {
    id: row.id,
    name: row.name,
    displayName: row.displayName ?? row.display_name ?? "",
    ageRange: row.ageRange ?? row.age_range ?? "",
    identityStyle: row.identityStyle ?? row.identity_style ?? "",
    city: row.city,
    bio: row.bio,
    vibe: row.vibe,
    appearanceDescription: row.appearanceDescription ?? row.appearance_description ?? "",
    masterReferenceImageUrl,
    faceReferenceImageUrl:
      row.faceReferenceImageUrl ?? row.face_reference_image_url ?? masterReferenceImageUrl,
    styleReferenceImageUrl:
      row.styleReferenceImageUrl ?? row.style_reference_image_url ?? "",
    bodyReferenceImageUrl:
      row.bodyReferenceImageUrl ?? row.body_reference_image_url ?? "",
    stylePrompt: row.stylePrompt ?? row.style_prompt ?? "",
    negativePrompt: row.negativePrompt ?? row.negative_prompt ?? "",
    postingTone: (row.postingTone ?? row.posting_tone ?? "soft lifestyle") as Character["postingTone"],
    identityLockStrength:
      (row.identityLockStrength ?? row.identity_lock_strength ?? "balanced") as IdentityLockStrength,
    lookProfile: (row.lookProfile ?? row.look_profile ?? "signature") as LookProfile,
    isActive: row.is_active,
    createdAt: normalizeDate(row.createdAt ?? row.created_at)!,
    updatedAt: normalizeDate(row.updatedAt ?? row.updated_at)!,
  };
}

function mapGenerationRow(row: DbGenerationRow): Generation {
  return {
    id: row.id,
    characterId: row.characterId ?? row.character_id ?? "",
    sceneTemplateId: row.sceneTemplateId ?? row.scene_template_id ?? "",
    finalPrompt: row.finalPrompt ?? row.final_prompt ?? "",
    imageUrls: Array.isArray(row.imageUrls)
      ? row.imageUrls
      : Array.isArray(row.image_urls)
        ? row.image_urls
        : [],
    selectedImageUrl: row.selectedImageUrl ?? row.selected_image_url ?? null,
    status: row.status,
    mode: row.mode ?? "lifestyle",
    sensualPoseBias: row.sensualPoseBias ?? row.sensual_pose_bias ?? null,
    shotType: row.shotType ?? row.shot_type ?? "half-body",
    qualityTags: Array.isArray(row.qualityTags)
      ? row.qualityTags
      : Array.isArray(row.quality_tags)
        ? row.quality_tags
        : [],
    isFavorite: Boolean(row.isFavorite ?? row.is_favorite ?? false),
    isArchived: Boolean(row.isArchived ?? row.is_archived ?? false),
    createdAt: normalizeDate(row.createdAt ?? row.created_at)!,
  };
}

function mapPostRow(row: DbPostRow): Post {
  return {
    id: row.id,
    characterId: row.characterId ?? row.character_id ?? "",
    generationId: row.generationId ?? row.generation_id ?? "",
    platform: row.platform,
    caption: row.caption,
    captionOptions: Array.isArray(row.captionOptions)
      ? row.captionOptions
      : Array.isArray(row.caption_options)
        ? row.caption_options
        : [],
    status: row.status,
    publishError: row.publishError ?? row.publish_error ?? null,
    scheduledAt: normalizeDate(row.scheduledAt ?? row.scheduled_at),
    publishedAt: normalizeDate(row.publishedAt ?? row.published_at),
    externalPostId: row.externalPostId ?? row.external_post_id ?? null,
    createdAt: normalizeDate(row.createdAt ?? row.created_at)!,
    updatedAt: normalizeDate(row.updatedAt ?? row.updated_at)!,
  };
}

function mapVideoClipRow(row: DbVideoClipRow): VideoClipDraft {
  return {
    id: row.id,
    generationId: row.generationId ?? row.generation_id ?? "",
    characterId: row.characterId ?? row.character_id ?? "",
    sceneTemplateId: row.sceneTemplateId ?? row.scene_template_id ?? "",
    sourceImageUrl: row.sourceImageUrl ?? row.source_image_url ?? "",
    videoUrl: row.videoUrl ?? row.video_url ?? "",
    thumbnailUrl: row.thumbnailUrl ?? row.thumbnail_url ?? "",
    motionPresetId: row.motionPresetId ?? row.motion_preset_id ?? "",
    motionLabel: row.motionLabel ?? row.motion_label ?? "",
    motionPrompt: row.motionPrompt ?? row.motion_prompt ?? "",
    durationSeconds: row.durationSeconds ?? row.duration_seconds ?? 0,
    status: row.status,
    createdAt: normalizeDate(row.createdAt ?? row.created_at)!,
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

function isMissingRelationError(error: unknown, relationName: string) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const code = "code" in error ? String((error as { code?: string }).code ?? "") : "";
  const message =
    "message" in error ? String((error as { message?: string }).message ?? "").toLowerCase() : "";

  return (
    code === "42P01" ||
    message.includes("does not exist") ||
    message.includes(`relation "${relationName.toLowerCase()}"`) ||
    message.includes(relationName.toLowerCase())
  );
}

function isMissingColumnError(error: unknown, columnName: string) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const code = "code" in error ? String((error as { code?: string }).code ?? "") : "";
  const message =
    "message" in error ? String((error as { message?: string }).message ?? "").toLowerCase() : "";
  const details =
    "details" in error ? String((error as { details?: string }).details ?? "").toLowerCase() : "";

  return (
    code === "42703" ||
    message.includes(columnName.toLowerCase()) ||
    details.includes(columnName.toLowerCase())
  );
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
        face_reference_image_url text not null default '',
        style_reference_image_url text not null default '',
        body_reference_image_url text not null default '',
        style_prompt text not null,
        negative_prompt text not null,
        posting_tone text not null,
        identity_lock_strength text not null default 'balanced',
        look_profile text not null default 'signature',
        is_active boolean not null default true,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )
    `;

      await sql`alter table characters add column if not exists face_reference_image_url text not null default ''`;
      await sql`alter table characters add column if not exists style_reference_image_url text not null default ''`;
      await sql`alter table characters add column if not exists body_reference_image_url text not null default ''`;
      await sql`alter table characters add column if not exists identity_lock_strength text not null default 'balanced'`;
      await sql`alter table characters add column if not exists look_profile text not null default 'signature'`;

      await sql`
        create table if not exists generations (
          id text primary key,
          character_id text not null references characters(id) on delete cascade,
          scene_template_id text not null references scene_templates(id),
          final_prompt text not null,
          image_urls jsonb not null default '[]'::jsonb,
          selected_image_url text,
          status text not null,
          mode text not null default 'lifestyle',
          sensual_pose_bias text,
          shot_type text not null default 'half-body',
          quality_tags jsonb not null default '[]'::jsonb,
          is_favorite boolean not null default false,
          is_archived boolean not null default false,
          created_at timestamptz not null default now()
        )
      `;

      await sql`alter table generations add column if not exists mode text not null default 'lifestyle'`;
      await sql`alter table generations add column if not exists sensual_pose_bias text`;
      await sql`alter table generations add column if not exists shot_type text not null default 'half-body'`;
      await sql`alter table generations add column if not exists quality_tags jsonb not null default '[]'::jsonb`;
      await sql`alter table generations add column if not exists is_favorite boolean not null default false`;
      await sql`alter table generations add column if not exists is_archived boolean not null default false`;

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

      await sql`
        create table if not exists video_clips (
          id text primary key,
          generation_id text not null references generations(id) on delete cascade,
          character_id text not null references characters(id) on delete cascade,
          scene_template_id text not null references scene_templates(id),
          source_image_url text not null,
          video_url text not null,
          thumbnail_url text not null,
          motion_preset_id text not null,
          motion_label text not null,
          motion_prompt text not null,
          duration_seconds integer not null,
          status text not null default 'draft',
          created_at timestamptz not null default now()
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
  const supabase = getSupabaseDbClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("characters")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => mapCharacterRow(row as DbCharacterRow));
  }

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
        face_reference_image_url as "faceReferenceImageUrl",
        style_reference_image_url as "styleReferenceImageUrl",
        body_reference_image_url as "bodyReferenceImageUrl",
        style_prompt as "stylePrompt",
        negative_prompt as "negativePrompt",
        posting_tone as "postingTone",
        identity_lock_strength as "identityLockStrength",
        look_profile as "lookProfile",
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
  const supabase = getSupabaseDbClient();

  if (supabase) {
    const { data, error } = await supabase.from("characters").select("*").eq("id", id).maybeSingle();

    if (error) {
      throw error;
    }

    return data ? mapCharacterRow(data as DbCharacterRow) : null;
  }

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
        face_reference_image_url as "faceReferenceImageUrl",
        style_reference_image_url as "styleReferenceImageUrl",
        body_reference_image_url as "bodyReferenceImageUrl",
        style_prompt as "stylePrompt",
        negative_prompt as "negativePrompt",
        posting_tone as "postingTone",
        identity_lock_strength as "identityLockStrength",
        look_profile as "lookProfile",
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
  const supabase = getSupabaseDbClient();

  if (supabase) {
    const { data, error } = await supabase.from("posts").select("*").order("updated_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => mapPostRow(row as DbPostRow));
  }

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

async function listVideoClipsFromDb() {
  const supabase = getSupabaseDbClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("video_clips")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      if (isMissingRelationError(error, "video_clips")) {
        return [];
      }
      throw error;
    }

    return (data ?? []).map((row) => mapVideoClipRow(row as DbVideoClipRow));
  }

  const sql = requireSql();
  const rows = await withBootstrapOnMissingSchema(() =>
    sql<DbVideoClipRow[]>`
      select
        id,
        generation_id,
        character_id,
        scene_template_id,
        source_image_url,
        video_url,
        thumbnail_url,
        motion_preset_id,
        motion_label,
        motion_prompt,
        duration_seconds,
        status,
        created_at
      from video_clips
      order by created_at desc
    `,
  );

  return rows.map(mapVideoClipRow);
}

async function listGenerationsFromDb() {
  const supabase = getSupabaseDbClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("generations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => mapGenerationRow(row as DbGenerationRow));
  }

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
        mode,
        sensual_pose_bias,
        shot_type,
        quality_tags,
        is_favorite,
        is_archived,
        created_at
      from generations
      order by created_at desc
    `,
  );

  return rows.map(mapGenerationRow);
}

export async function listCharacters() {
  if (!hasDatabaseUrl) {
    return getMemoryState().characters;
  }

  return withReadTimeout("listCharacters", () => listCharactersFromDb());
}

export async function getCharacter(id: string) {
  if (!hasDatabaseUrl) {
    return getMemoryState().characters.find((character) => character.id === id) ?? null;
  }

  return withReadTimeout("getCharacter", () => getCharacterFromDb(id));
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

  const supabase = getSupabaseDbClient();
  if (supabase) {
    const id = makeId("char");
    const payload = {
      id,
      name: input.name,
      display_name: input.displayName,
      age_range: input.ageRange,
      identity_style: input.identityStyle,
      city: input.city,
      bio: input.bio,
      vibe: input.vibe,
      appearance_description: input.appearanceDescription,
      master_reference_image_url: input.masterReferenceImageUrl,
      face_reference_image_url: input.faceReferenceImageUrl,
      style_reference_image_url: input.styleReferenceImageUrl,
      body_reference_image_url: input.bodyReferenceImageUrl,
      style_prompt: input.stylePrompt,
      negative_prompt: input.negativePrompt,
      posting_tone: input.postingTone,
      identity_lock_strength: input.identityLockStrength,
      look_profile: input.lookProfile,
      is_active: input.isActive,
    };

    let { data, error }: { data: DbCharacterRow | null; error: Error | null } =
      await withWriteTimeout("createCharacter", async () => {
        const response = await supabase.from("characters").insert(payload).select("*").single();
        return {
          data: (response.data as DbCharacterRow | null) ?? null,
          error: (response.error as Error | null) ?? null,
        };
      });

    if (error && isMissingColumnError(error, "look_profile")) {
      const fallbackPayload = { ...payload };
      delete (fallbackPayload as Record<string, unknown>).look_profile;

      const fallbackResponse = await withWriteTimeout("createCharacter.compat", async () => {
        const response = await supabase.from("characters").insert(fallbackPayload).select("*").single();
        return {
          data: (response.data as DbCharacterRow | null) ?? null,
          error: (response.error as Error | null) ?? null,
        };
      });

      data = fallbackResponse.data;
      error = fallbackResponse.error;
    }

    if (error) {
      throw error;
    }

    return mapCharacterRow(data as DbCharacterRow);
  }

  const sql = requireSql();
  const id = makeId("char");
  const rows = await withWriteTimeout("createCharacter", async () => {
    await ensureDatabaseReady();

    return sql<DbCharacterRow[]>`
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
        face_reference_image_url,
        style_reference_image_url,
        body_reference_image_url,
        style_prompt,
        negative_prompt,
        posting_tone,
        identity_lock_strength,
        look_profile,
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
        ${input.faceReferenceImageUrl},
        ${input.styleReferenceImageUrl},
        ${input.bodyReferenceImageUrl},
        ${input.stylePrompt},
        ${input.negativePrompt},
        ${input.postingTone},
        ${input.identityLockStrength},
        ${input.lookProfile},
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
        face_reference_image_url as "faceReferenceImageUrl",
        style_reference_image_url as "styleReferenceImageUrl",
        body_reference_image_url as "bodyReferenceImageUrl",
        style_prompt as "stylePrompt",
        negative_prompt as "negativePrompt",
        posting_tone as "postingTone",
        identity_lock_strength as "identityLockStrength",
        look_profile as "lookProfile",
        is_active,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;
  });

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

  const existing = await withWriteTimeout("updateCharacter.readCurrent", () => getCharacterFromDb(id));

  if (!existing) {
    return null;
  }

  const next: Character = {
    ...existing,
    ...input,
    updatedAt: now(),
  };

  const supabase = getSupabaseDbClient();
  if (supabase) {
    const payload = {
      name: next.name,
      display_name: next.displayName,
      age_range: next.ageRange,
      identity_style: next.identityStyle,
      city: next.city,
      bio: next.bio,
      vibe: next.vibe,
      appearance_description: next.appearanceDescription,
      master_reference_image_url: next.masterReferenceImageUrl,
      face_reference_image_url: next.faceReferenceImageUrl,
      style_reference_image_url: next.styleReferenceImageUrl,
      body_reference_image_url: next.bodyReferenceImageUrl,
      style_prompt: next.stylePrompt,
      negative_prompt: next.negativePrompt,
      posting_tone: next.postingTone,
      identity_lock_strength: next.identityLockStrength,
      look_profile: next.lookProfile,
      is_active: next.isActive,
      updated_at: next.updatedAt,
    };

    let { data, error }: { data: DbCharacterRow | null; error: Error | null } =
      await withWriteTimeout("updateCharacter", async () => {
        const response = await supabase
          .from("characters")
          .update(payload)
          .eq("id", id)
          .select("*")
          .single();
        return {
          data: (response.data as DbCharacterRow | null) ?? null,
          error: (response.error as Error | null) ?? null,
        };
      });

    if (error && isMissingColumnError(error, "look_profile")) {
      const fallbackPayload = { ...payload };
      delete (fallbackPayload as Record<string, unknown>).look_profile;

      const fallbackResponse = await withWriteTimeout("updateCharacter.compat", async () => {
        const response = await supabase
          .from("characters")
          .update(fallbackPayload)
          .eq("id", id)
          .select("*")
          .single();
        return {
          data: (response.data as DbCharacterRow | null) ?? null,
          error: (response.error as Error | null) ?? null,
        };
      });

      data = fallbackResponse.data;
      error = fallbackResponse.error;
    }

    if (error) {
      throw error;
    }

    return mapCharacterRow(data as DbCharacterRow);
  }

  const sql = requireSql();
  const rows = await withWriteTimeout("updateCharacter", async () => {
    await ensureDatabaseReady();

    return sql<DbCharacterRow[]>`
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
        face_reference_image_url = ${next.faceReferenceImageUrl},
        style_reference_image_url = ${next.styleReferenceImageUrl},
        body_reference_image_url = ${next.bodyReferenceImageUrl},
        style_prompt = ${next.stylePrompt},
        negative_prompt = ${next.negativePrompt},
        posting_tone = ${next.postingTone},
        identity_lock_strength = ${next.identityLockStrength},
        look_profile = ${next.lookProfile},
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
        face_reference_image_url as "faceReferenceImageUrl",
        style_reference_image_url as "styleReferenceImageUrl",
        body_reference_image_url as "bodyReferenceImageUrl",
        style_prompt as "stylePrompt",
        negative_prompt as "negativePrompt",
        posting_tone as "postingTone",
        identity_lock_strength as "identityLockStrength",
        look_profile as "lookProfile",
        is_active,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;
  });

  return mapCharacterRow(rows[0]);
}

export async function deleteCharacter(id: string) {
  if (!hasDatabaseUrl) {
    const state = getMemoryState();
    const index = state.characters.findIndex((character) => character.id === id);

    if (index === -1) {
      return false;
    }

    state.characters.splice(index, 1);
    state.generations = state.generations.filter((generation) => generation.characterId !== id);
    state.posts = state.posts.filter((post) => post.characterId !== id);
    state.videoClips = state.videoClips.filter((clip) => clip.characterId !== id);
    return true;
  }

  const supabase = getSupabaseDbClient();
  if (supabase) {
    const { error, count }: { error: Error | null; count: number | null } =
      await withWriteTimeout("deleteCharacter", async () => {
        const response = await supabase.from("characters").delete({ count: "exact" }).eq("id", id);
        return {
          error: (response.error as Error | null) ?? null,
          count: response.count ?? null,
        };
      });

    if (error) {
      throw error;
    }

    return Boolean(count);
  }

  const sql = requireSql();
  const deletedRows = await withWriteTimeout("deleteCharacter", async () => {
    await ensureDatabaseReady();

    return sql<{ id: string }[]>`
      delete from characters
      where id = ${id}
      returning id
    `;
  });

  return deletedRows.length > 0;
}

export async function listPosts() {
  if (!hasDatabaseUrl) {
    return getMemoryState().posts;
  }

  return withReadTimeout("listPosts", () => listPostsFromDb());
}

export async function listVideoClips() {
  if (!hasDatabaseUrl) {
    return getMemoryState().videoClips;
  }

  return withReadTimeout("listVideoClips", () => listVideoClipsFromDb());
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

  const supabase = getSupabaseDbClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("posts")
      .update({
        caption: next.caption,
        platform: next.platform,
        status: next.status,
        scheduled_at: next.scheduledAt,
        updated_at: next.updatedAt,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return mapPostRow(data as DbPostRow);
  }

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

export async function updateGenerationMeta(
  id: string,
  input: Partial<Pick<Generation, "isFavorite" | "isArchived" | "qualityTags">>,
) {
  if (!hasDatabaseUrl) {
    const state = getMemoryState();
    const index = state.generations.findIndex((generation) => generation.id === id);

    if (index === -1) {
      return null;
    }

    state.generations[index] = {
      ...state.generations[index],
      ...input,
    };

    return state.generations[index];
  }

  const supabase = getSupabaseDbClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("generations")
      .update({
        is_favorite: input.isFavorite,
        is_archived: input.isArchived,
        quality_tags: input.qualityTags,
      })
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? mapGenerationRow(data as DbGenerationRow) : null;
  }

  const sql = requireSql();
  await ensureDatabaseReady();
  const existingRows = await sql<DbGenerationRow[]>`
    select
      id,
      character_id,
      scene_template_id,
      final_prompt as "finalPrompt",
      image_urls,
      selected_image_url,
      status,
      mode,
      sensual_pose_bias,
      shot_type,
      quality_tags,
      is_favorite,
      is_archived,
      created_at
    from generations
    where id = ${id}
    limit 1
  `;
  const existing = existingRows[0] ? mapGenerationRow(existingRows[0]) : null;

  if (!existing) {
    return null;
  }

  const rows = await sql<DbGenerationRow[]>`
    update generations set
      is_favorite = ${input.isFavorite ?? existing.isFavorite},
      is_archived = ${input.isArchived ?? existing.isArchived},
      quality_tags = ${sql.json(input.qualityTags ?? existing.qualityTags)}
    where id = ${id}
    returning
      id,
      character_id,
      scene_template_id,
      final_prompt as "finalPrompt",
      image_urls,
      selected_image_url,
      status,
      mode,
      sensual_pose_bias,
      shot_type,
      quality_tags,
      is_favorite,
      is_archived,
      created_at
  `;

  return rows[0] ? mapGenerationRow(rows[0]) : null;
}

export async function deleteGeneration(id: string) {
  if (!hasDatabaseUrl) {
    const state = getMemoryState();
    const originalLength = state.generations.length;
    state.generations = state.generations.filter((generation) => generation.id !== id);
    state.posts = state.posts.filter((post) => post.generationId !== id);
    state.videoClips = state.videoClips.filter((clip) => clip.generationId !== id);
    return state.generations.length !== originalLength;
  }

  const supabase = getSupabaseDbClient();
  if (supabase) {
    const { error, count } = await supabase
      .from("generations")
      .delete({ count: "exact" })
      .eq("id", id);

    if (error) {
      throw error;
    }

    return Boolean(count);
  }

  const sql = requireSql();
  await ensureDatabaseReady();
  const rows = await sql<{ id: string }[]>`
    delete from generations
    where id = ${id}
    returning id
  `;
  return rows.length > 0;
}

async function insertGenerationRecord(input: {
  id: string;
  characterId: string;
  sceneTemplateId: string;
  finalPrompt: string;
  imageUrls: string[];
  mode: StyleMode;
  sensualPoseBias: SensualPoseBias | null;
  shotType: ShotType;
  qualityTags: QualityTag[];
}) {
  const supabase = getSupabaseDbClient();

  if (supabase) {
    const payload = {
      id: input.id,
      character_id: input.characterId,
      scene_template_id: input.sceneTemplateId,
      final_prompt: input.finalPrompt,
      image_urls: input.imageUrls,
      selected_image_url: null,
      status: "completed",
      mode: input.mode,
      sensual_pose_bias: input.sensualPoseBias,
      shot_type: input.shotType,
      quality_tags: input.qualityTags,
      is_favorite: false,
      is_archived: false,
    };

    const primaryInsert = await supabase
      .from("generations")
      .insert(payload)
      .select("*")
      .single();

    if (!primaryInsert.error) {
      return mapGenerationRow(primaryInsert.data as DbGenerationRow);
    }

    const compatibilityColumns = [
      "mode",
      "sensual_pose_bias",
      "shot_type",
      "quality_tags",
      "is_favorite",
      "is_archived",
    ];

    const shouldRetryCompat = compatibilityColumns.some((column) =>
      isMissingColumnError(primaryInsert.error, column),
    );

    if (!shouldRetryCompat) {
      throw primaryInsert.error;
    }

    const fallbackPayload = {
      id: input.id,
      character_id: input.characterId,
      scene_template_id: input.sceneTemplateId,
      final_prompt: input.finalPrompt,
      image_urls: input.imageUrls,
      selected_image_url: null,
      status: "completed",
    };

    const fallbackInsert = await supabase
      .from("generations")
      .insert(fallbackPayload)
      .select("*")
      .single();

    if (fallbackInsert.error) {
      throw fallbackInsert.error;
    }

    return mapGenerationRow(fallbackInsert.data as DbGenerationRow);
  }

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
      ,
      mode,
      sensual_pose_bias,
      shot_type,
      quality_tags,
      is_favorite,
      is_archived
    ) values (
      ${input.id},
      ${input.characterId},
      ${input.sceneTemplateId},
      ${input.finalPrompt},
      ${sql.json(input.imageUrls)},
      ${null},
      ${"completed"}
      ,
      ${input.mode},
      ${input.sensualPoseBias},
      ${input.shotType},
      ${sql.json(input.qualityTags)},
      ${false},
      ${false}
    )
    returning
      id,
      character_id,
      scene_template_id,
      final_prompt as "finalPrompt",
      image_urls,
      selected_image_url,
      status,
      mode,
      sensual_pose_bias,
      shot_type,
      quality_tags,
      is_favorite,
      is_archived,
      created_at
  `;

  return mapGenerationRow(rows[0]);
}

const shotRotation: ShotType[] = ["half-body", "three-quarter", "full-body", "close"];

const fluxCarouselFrames: Array<{
  shotType: ShotType;
  direction: string;
}> = [
  {
    shotType: "three-quarter",
    direction:
      "Frame role: hero image. Turn-back street frame near a wall or sidewalk edge, strongest city-lookbook image, direct recognisable face, clean daylight candid.",
  },
  {
    shotType: "half-body",
    direction:
      "Frame role: half-body supporting frame. Cleaner torso-up street portrait, bag visible, softer expression, candid editorial street snapshot.",
  },
  {
    shotType: "close",
    direction:
      "Frame role: close crop. Near-face daylight portrait with wind-touched hair or bangs, cleaner crop, stronger eye and face detail, natural film-like realism.",
  },
  {
    shotType: "full-body",
    direction:
      "Frame role: walking or back-view frame. Full outfit visible, walking away or side/back angle, city blur in background, complete carousel variation.",
  },
];

function chooseShotType(characterId: string, sceneTemplateId: string, history: Generation[]) {
  const recentForCharacter = history.filter((item) => item.characterId === characterId).slice(0, 6);
  const recentSameScene = recentForCharacter.filter((item) => item.sceneTemplateId === sceneTemplateId);
  const blockedShots = new Set<ShotType>();

  for (const item of recentForCharacter.slice(0, 2)) {
    blockedShots.add(item.shotType);
  }

  if (recentSameScene[0]?.shotType) {
    blockedShots.add(recentSameScene[0].shotType);
  }

  const candidate = shotRotation.find((shotType) => !blockedShots.has(shotType));
  return candidate ?? shotRotation[(recentForCharacter.length + recentSameScene.length) % shotRotation.length];
}

function getReferenceImageUrl(character: Character) {
  return (
    character.faceReferenceImageUrl ||
    character.masterReferenceImageUrl ||
    character.styleReferenceImageUrl ||
    character.bodyReferenceImageUrl ||
    undefined
  );
}

function getPromptStrengthForCharacter(character: Character, inputStrength?: IdentityLockStrength) {
  const strength = inputStrength ?? character.identityLockStrength;

  if (strength === "max") {
    return 0.45;
  }

  if (strength === "high") {
    return 0.62;
  }

  return 0.82;
}

function shouldUseFluxCarousel(character: Character, input: GenerateImageInput) {
  return character.lookProfile === "flux-street" && (input.imageCount ?? 1) > 1;
}

async function generateFluxCarouselSet(input: {
  character: Character;
  scene: SceneTemplate;
  mode: StyleMode;
  sensualPoseBias: SensualPoseBias | null;
  imageCount: number;
  customPrompt?: string;
  identityLockStrength?: IdentityLockStrength;
}) {
  const plan = fluxCarouselFrames.slice(0, Math.max(1, Math.min(input.imageCount, fluxCarouselFrames.length)));
  const imageUrls: string[] = [];

  for (const [index, frame] of plan.entries()) {
    const perFramePrompt = composeImagePrompt({
      character: input.character,
      scene: input.scene,
      customPrompt: [input.customPrompt?.trim(), frame.direction].filter(Boolean).join(" "),
      variantSeed: makeId(`variant-${index + 1}`),
      mode: input.mode,
      sensualPoseBias: input.sensualPoseBias ?? undefined,
      shotType: frame.shotType,
      imageCount: plan.length,
    });

    const urls = await generatePersonaImages({
      prompt: perFramePrompt,
      imageCount: 1,
      referenceImageUrl: getReferenceImageUrl(input.character),
      promptStrength: getPromptStrengthForCharacter(input.character, input.identityLockStrength),
    });

    imageUrls.push(...urls);
  }

  return {
    imageUrls,
    heroShotType: plan[0]?.shotType ?? "three-quarter",
    finalPrompt: composeImagePrompt({
      character: input.character,
      scene: input.scene,
      customPrompt: [
        input.customPrompt?.trim(),
        "Series structure: hero image, half-body support frame, close face crop, walking or back-view frame.",
      ]
        .filter(Boolean)
        .join(" "),
      variantSeed: makeId("variant"),
      mode: input.mode,
      sensualPoseBias: input.sensualPoseBias ?? undefined,
      shotType: plan[0]?.shotType ?? "three-quarter",
      imageCount: plan.length,
    }),
  };
}

function buildQualityTags(input: {
  character: Character;
  sceneTemplateId: string;
  mode: StyleMode;
  shotType: ShotType;
  selectedImageUrl?: string | null;
  customPrompt?: string;
}): QualityTag[] {
  const tags: QualityTag[] = ["background clear"];
  const riskScore = getIdentityRiskScore({
    character: input.character,
    mode: input.mode,
    shotType: input.shotType,
    customPromptUsed: Boolean(input.customPrompt?.trim()),
  });

  if (input.shotType !== "close") {
    tags.push("framing good");
  }

  if (riskScore <= 44) {
    tags.push("face stable");
  }

  if (riskScore >= 45) {
    tags.push("off-identity risk");
  }

  if (
    input.selectedImageUrl ||
    ["half-body", "three-quarter", "full-body"].includes(input.shotType) ||
    input.mode !== "sensual"
  ) {
    tags.push("publish-ready");
  }

  return Array.from(new Set(tags));
}

export async function createGeneration(input: GenerateImageInput) {
  const character = hasDatabaseUrl
    ? await withWorkflowTimeout("createGeneration.getCharacter", () =>
        getCharacterFromDb(input.characterId),
      )
    : await getCharacter(input.characterId);
  const generationHistory = hasDatabaseUrl
    ? await withReadTimeout("createGeneration.listGenerations", () => listGenerationsFromDb())
    : getMemoryState().generations;
  const scene = sceneLibrary.find((item) => item.id === input.sceneTemplateId);

  if (!character || !scene) {
    throw new Error("Character or scene template not found.");
  }

  const mode = input.mode ?? "lifestyle";
  const sensualPoseBias = mode === "sensual" ? input.sensualPoseBias ?? "soft glam" : null;
  const defaultShotType = chooseShotType(character.id, scene.id, generationHistory);

  const fluxCarousel = shouldUseFluxCarousel(character, input)
    ? await generateFluxCarouselSet({
        character,
        scene,
        mode,
        sensualPoseBias,
        imageCount: input.imageCount,
        customPrompt: input.customPrompt,
        identityLockStrength: input.identityLockStrength,
      })
    : null;

  const shotType = fluxCarousel?.heroShotType ?? defaultShotType;
  const finalPrompt =
    fluxCarousel?.finalPrompt ??
    composeImagePrompt({
      character,
      scene,
      customPrompt: input.customPrompt,
      variantSeed: makeId("variant"),
      mode,
      sensualPoseBias: sensualPoseBias ?? undefined,
      shotType,
      imageCount: input.imageCount,
    });
  const imageUrls =
    fluxCarousel?.imageUrls ??
    (await generatePersonaImages({
      prompt: finalPrompt,
      imageCount: input.imageCount,
      referenceImageUrl: getReferenceImageUrl(character),
      promptStrength: getPromptStrengthForCharacter(character, input.identityLockStrength),
    }));

  if (!hasDatabaseUrl) {
    const generation: Generation = {
      id: makeId("gen"),
      characterId: character.id,
      sceneTemplateId: scene.id,
      finalPrompt,
      imageUrls,
      selectedImageUrl: null,
      status: "completed",
      mode,
      sensualPoseBias,
      shotType,
      qualityTags: buildQualityTags({
        character,
        sceneTemplateId: scene.id,
        mode,
        shotType,
        customPrompt: input.customPrompt,
      }),
      isFavorite: false,
      isArchived: false,
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
    mode,
    sensualPoseBias,
    shotType,
    qualityTags: buildQualityTags({
      character,
      sceneTemplateId: scene.id,
      mode,
      shotType,
      customPrompt: input.customPrompt,
    }),
  });

  return { generation };
}

export async function createCaption(input: CaptionInput) {
  const character = hasDatabaseUrl
    ? await withWorkflowTimeout("createCaption.getCharacter", () =>
        getCharacterFromDb(input.characterId),
      )
    : await getCharacter(input.characterId);
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
    platform: input.platform === "both" ? "instagram" : input.platform,
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

  const supabase = getSupabaseDbClient();
  if (supabase) {
    const { data: generationData, error: generationError } = await supabase
      .from("generations")
      .update({
        selected_image_url: imageUrl,
        status: "approved",
      })
      .eq("id", generationId)
      .select("*")
      .maybeSingle();

    if (generationError) {
      throw generationError;
    }

    const generation = generationData ? mapGenerationRow(generationData as DbGenerationRow) : null;

    if (!generation) {
      return null;
    }

    const { data: existingPostData, error: existingPostError } = await supabase
      .from("posts")
      .select("*")
      .eq("generation_id", generation.id)
      .limit(1)
      .maybeSingle();

    if (existingPostError) {
      throw existingPostError;
    }

    if (existingPostData) {
      return {
        generation,
        draftPost: mapPostRow(existingPostData as DbPostRow),
      };
    }

    const resolvedCharacter = await withWorkflowTimeout("selectGenerationImage.getCharacter", () =>
      getCharacterFromDb(generation.characterId),
    );
    const scene = sceneLibrary.find((item) => item.id === generation.sceneTemplateId);

    if (!resolvedCharacter || !scene) {
      throw new Error("Unable to create draft post for this generation.");
    }

    const captionResult = await generateCaptionOptions({
      character: resolvedCharacter,
      scene,
    });

    const { data: insertedPostData, error: insertedPostError } = await supabase
      .from("posts")
      .insert({
        id: makeId("post"),
        character_id: resolvedCharacter.id,
        generation_id: generation.id,
        platform: "instagram",
        caption: captionResult.options[0] ?? "",
        caption_options: captionResult.options,
        status: "draft",
        publish_error: null,
        scheduled_at: null,
        published_at: null,
        external_post_id: null,
        created_at: now(),
        updated_at: now(),
      })
      .select("*")
      .single();

    if (insertedPostError) {
      throw insertedPostError;
    }

    return {
      generation,
      draftPost: mapPostRow(insertedPostData as DbPostRow),
    };
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
  const resolvedCharacter = hasDatabaseUrl
    ? await withWorkflowTimeout("selectGenerationImage.getCharacter", () =>
        getCharacterFromDb(generation.characterId),
      )
    : character;
  const scene = sceneLibrary.find((item) => item.id === generation.sceneTemplateId);

  if (!resolvedCharacter || !scene) {
    throw new Error("Unable to create draft post for this generation.");
  }

  const captionResult = await generateCaptionOptions({
    character: resolvedCharacter,
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
      ${resolvedCharacter.id},
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

export async function createDraftPostForGeneration(generationId: string) {
  const snapshot = await getDatabaseSnapshot();
  const generation = snapshot.generations.find((item) => item.id === generationId) ?? null;

  if (!generation) {
    return null;
  }

  const targetImage = generation.selectedImageUrl ?? generation.imageUrls[0] ?? null;

  if (!targetImage) {
    throw new Error("No image is available for this generation.");
  }

  return selectGenerationImage(generationId, targetImage);
}

export async function createVideoClipDraft(input: {
  generationId: string;
  sourceImageUrl: string;
  videoUrl: string;
  motionPresetId: string;
  motionLabel: string;
  motionPrompt: string;
  durationSeconds: number;
}) {
  const snapshot = await getDatabaseSnapshot();
  const generation = snapshot.generations.find((item) => item.id === input.generationId) ?? null;

  if (!generation) {
    throw new Error("Generation not found.");
  }

  const clip: VideoClipDraft = {
    id: makeId("clip"),
    generationId: generation.id,
    characterId: generation.characterId,
    sceneTemplateId: generation.sceneTemplateId,
    sourceImageUrl: input.sourceImageUrl,
    videoUrl: input.videoUrl,
    thumbnailUrl: generation.selectedImageUrl ?? generation.imageUrls[0] ?? input.sourceImageUrl,
    motionPresetId: input.motionPresetId,
    motionLabel: input.motionLabel,
    motionPrompt: input.motionPrompt,
    durationSeconds: input.durationSeconds,
    status: "draft",
    createdAt: now(),
  };

  if (!hasDatabaseUrl) {
    getMemoryState().videoClips.unshift(clip);
    return clip;
  }

  const supabase = getSupabaseDbClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("video_clips")
      .insert({
        id: clip.id,
        generation_id: clip.generationId,
        character_id: clip.characterId,
        scene_template_id: clip.sceneTemplateId,
        source_image_url: clip.sourceImageUrl,
        video_url: clip.videoUrl,
        thumbnail_url: clip.thumbnailUrl,
        motion_preset_id: clip.motionPresetId,
        motion_label: clip.motionLabel,
        motion_prompt: clip.motionPrompt,
        duration_seconds: clip.durationSeconds,
        status: clip.status,
        created_at: clip.createdAt,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return mapVideoClipRow(data as DbVideoClipRow);
  }

  const sql = requireSql();
  await ensureDatabaseReady();
  const rows = await sql<DbVideoClipRow[]>`
    insert into video_clips (
      id,
      generation_id,
      character_id,
      scene_template_id,
      source_image_url,
      video_url,
      thumbnail_url,
      motion_preset_id,
      motion_label,
      motion_prompt,
      duration_seconds,
      status,
      created_at
    ) values (
      ${clip.id},
      ${clip.generationId},
      ${clip.characterId},
      ${clip.sceneTemplateId},
      ${clip.sourceImageUrl},
      ${clip.videoUrl},
      ${clip.thumbnailUrl},
      ${clip.motionPresetId},
      ${clip.motionLabel},
      ${clip.motionPrompt},
      ${clip.durationSeconds},
      ${clip.status},
      ${clip.createdAt}
    )
    returning
      id,
      generation_id,
      character_id,
      scene_template_id,
      source_image_url,
      video_url,
      thumbnail_url,
      motion_preset_id,
      motion_label,
      motion_prompt,
      duration_seconds,
      status,
      created_at
  `;

  return mapVideoClipRow(rows[0]);
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

  const supabase = getSupabaseDbClient();
  if (supabase) {
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .maybeSingle();

    if (postError) {
      throw postError;
    }

    const post = postData ? mapPostRow(postData as DbPostRow) : null;

    if (!post) {
      throw new Error("Post not found.");
    }

    const target = platform ?? post.platform;
    const { data: generationData, error: generationError } = await supabase
      .from("generations")
      .select("*")
      .eq("id", post.generationId)
      .maybeSingle();

    if (generationError) {
      throw generationError;
    }

    const generation = generationData ? mapGenerationRow(generationData as DbGenerationRow) : null;
    const imageUrl = generation?.selectedImageUrl;

    if (!imageUrl) {
      const { data: updatedData, error: updateError } = await supabase
        .from("posts")
        .update({
          platform: target,
          status: "failed",
          publish_error: "No approved image selected for this post.",
          external_post_id: null,
          published_at: null,
          updated_at: now(),
        })
        .eq("id", postId)
        .select("*")
        .single();

      if (updateError) {
        throw updateError;
      }

      return {
        post: mapPostRow(updatedData as DbPostRow),
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

    const { data: updatedData, error: updateError } = await supabase
      .from("posts")
      .update({
        platform: target,
        status: nextStatus,
        publish_error: result.error,
        external_post_id: result.externalPostId,
        published_at: result.ok ? now() : null,
        updated_at: now(),
      })
      .eq("id", postId)
      .select("*")
      .single();

    if (updateError) {
      throw updateError;
    }

    return {
      post: mapPostRow(updatedData as DbPostRow),
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
      totalVideoClips: state.videoClips.length,
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
    recentVideoClips: state.videoClips.slice(0, 4).map((clip) => {
      const characterName =
        state.characters.find((item) => item.id === clip.characterId)?.displayName ?? "Unknown";
      const sceneTitle =
        sceneLibrary.find((item) => item.id === clip.sceneTemplateId)?.title ?? "Scene";
      const sourcePostId =
        state.posts.find((item) => item.generationId === clip.generationId)?.id ?? null;

      return {
        ...clip,
        characterName,
        sceneTitle,
        sourcePostId,
      };
    }),
    weeklyPlan: buildWeeklyPlan(
      state.generations.map((generation) => ({
        ...generation,
        characterName:
          state.characters.find((item) => item.id === generation.characterId)?.displayName ?? "Unknown",
        sceneTitle:
          sceneLibrary.find((item) => item.id === generation.sceneTemplateId)?.title ?? "Unknown scene",
        previewImageUrl: generation.selectedImageUrl ?? generation.imageUrls[0] ?? null,
        linkedPostId: state.posts.find((item) => item.generationId === generation.id)?.id ?? null,
        linkedPostStatus: state.posts.find((item) => item.generationId === generation.id)?.status ?? null,
      })),
    ),
  });

  if (!hasDatabaseUrl) {
    return buildPayload(getMemoryState());
  }

  const [characters, generations, posts, videoClips] = await withReadTimeout("getDashboardData", async () =>
    Promise.all([
      listCharactersFromDb(),
      listGenerationsFromDb(),
      listPostsFromDb(),
      listVideoClipsFromDb(),
    ]),
  );

  return {
    metrics: {
      totalCharacters: characters.length,
      totalGeneratedImages: generations.reduce(
        (total, generation) => total + generation.imageUrls.length,
        0,
      ),
      totalDraftedPosts: posts.filter((post) => post.status === "draft").length,
      totalPublishedPosts: posts.filter((post) => post.status === "published").length,
      totalVideoClips: videoClips.length,
    },
    recentGenerations: generations.slice(0, 5).map((generation) => {
      const characterName =
        characters.find((item) => item.id === generation.characterId)?.displayName ?? "Unknown";
      const sceneTitle =
        sceneLibrary.find((item) => item.id === generation.sceneTemplateId)?.title ?? "Scene";

      return {
        ...generation,
        characterName,
        sceneTitle,
      };
    }),
    recentPosts: posts.slice(0, 5).map((post) => {
      const characterName =
        characters.find((item) => item.id === post.characterId)?.displayName ?? "Unknown";
      const imageUrl =
        generations.find((item) => item.id === post.generationId)?.selectedImageUrl ?? null;

      return {
        ...post,
        characterName,
        imageUrl,
      };
    }),
    recentVideoClips: videoClips.slice(0, 4).map((clip) => {
      const characterName =
        characters.find((item) => item.id === clip.characterId)?.displayName ?? "Unknown";
      const sceneTitle =
        sceneLibrary.find((item) => item.id === clip.sceneTemplateId)?.title ?? "Scene";
      const sourcePostId = posts.find((item) => item.generationId === clip.generationId)?.id ?? null;

      return {
        ...clip,
        characterName,
        sceneTitle,
        sourcePostId,
      };
    }),
    weeklyPlan: buildWeeklyPlan(
      generations.map((generation) => ({
        ...generation,
        characterName:
          characters.find((item) => item.id === generation.characterId)?.displayName ?? "Unknown",
        sceneTitle:
          sceneLibrary.find((item) => item.id === generation.sceneTemplateId)?.title ?? "Unknown scene",
        previewImageUrl: generation.selectedImageUrl ?? generation.imageUrls[0] ?? null,
        linkedPostId: posts.find((item) => item.generationId === generation.id)?.id ?? null,
        linkedPostStatus: posts.find((item) => item.generationId === generation.id)?.status ?? null,
      })),
    ),
  };
}

export async function getDatabaseSnapshot() {
  if (!hasDatabaseUrl) {
    return getMemoryState();
  }

  const [characters, generations, posts, videoClips] = await withReadTimeout("getDatabaseSnapshot", async () =>
    Promise.all([
      listCharactersFromDb(),
      listGenerationsFromDb(),
      listPostsFromDb(),
      listVideoClipsFromDb(),
    ]),
  );

  return {
    characters,
    generations,
    posts,
    videoClips,
  };
}
