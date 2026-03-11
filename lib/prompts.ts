import { Character, SceneTemplate } from "@/lib/types";

const styleBlock = [
  "instagram influencer lifestyle photo",
  "soft attractive vibe",
  "girl next door aesthetic",
  "candid everyday moment",
  "natural sunlight",
  "realistic skin texture",
  "natural feminine silhouette",
  "realistic body proportions",
].join(", ");

const consistencyBlock =
  "maintain the same facial identity across images, same person, same face, same hairline, same eye shape";

const negativeBlock = [
  "cartoon",
  "anime",
  "3d render",
  "plastic skin",
  "glamour photography",
  "supermodel pose",
  "studio lighting",
  "fake hdr",
  "over-retouched details",
  "distorted anatomy",
  "extra fingers",
  "uncanny facial symmetry",
  "exaggerated anatomy",
].join(", ");

function stableIndex(seed: string, optionsLength: number) {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return optionsLength === 0 ? 0 : hash % optionsLength;
}

function pickVariant(seed: string, options: string[]) {
  return options[stableIndex(seed, options.length)] ?? options[0] ?? "";
}

function getIdentityBlock(character: Character) {
  return [
    `${character.displayName} is an adult ${character.identityStyle} woman living in ${character.city}.`,
    character.appearanceDescription,
    character.vibe,
  ]
    .filter(Boolean)
    .join(", ");
}

function getSceneBlock(scene: SceneTemplate) {
  return scene.promptTemplate;
}

function getPoseOptions(scene: SceneTemplate) {
  const base = [
    "relaxed posture",
    "subtle body curve",
    "natural smile or playful expression",
    "avoid professional model poses",
  ];

  switch (scene.id) {
    case "morning-coffee":
      return [...base, "holding a ceramic mug", "slightly turning body", "looking away from camera"];
    case "kitchen-cooking":
      return [...base, "reaching toward ingredients", "side-angle candid movement", "natural hand interaction"];
    case "cafe-window":
      return [...base, "holding coffee", "leaning toward window light", "casual seated angle"];
    case "bookstore":
      return [...base, "holding a book", "walking between shelves", "glancing down at pages"];
    case "beach-walk":
      return [...base, "walking motion", "hair moved by breeze", "warm relaxed summer vibe"];
    case "poolside":
      return [...base, "seated poolside posture", "slightly turning body", "resting one hand near the pool edge"];
    case "city-shopping":
      return [...base, "mid-step walking pose", "holding shopping bags", "off-center candid body angle"];
    case "mirror-selfie":
      return [...base, "casual selfie angle", "phone visible in frame", "standing mirror pose"];
    case "sunset-balcony":
      return [...base, "leaning on railing", "looking toward skyline", "standing three-quarter pose"];
    case "casual-gym":
      return [...base, "active athleisure posture", "holding water bottle", "casual movement through frame"];
    case "weekend-brunch":
      return [...base, "holding cutlery or coffee", "seated brunch-table posture", "soft social expression"];
    case "reading-sofa":
      return [...base, "curled up on sofa", "holding an open book", "quiet indoor candid angle"];
    case "airport-waiting":
      return [...base, "sitting near luggage", "looking out window", "travel waiting posture"];
    case "hotel-morning":
      return [...base, "gentle morning stretch", "moving near curtains", "soft waking-up posture"];
    case "car-selfie":
      return [...base, "handheld selfie angle", "passenger seat posture", "slightly off-center framing"];
    case "rainy-window":
      return [...base, "standing by window", "soft contemplative expression", "three-quarter profile"];
    case "garden-afternoon":
      return [...base, "walking through garden", "light natural movement", "pausing near flowers"];
    case "rooftop-evening":
      return [...base, "leaning on rooftop rail", "turning toward city lights", "standing evening pose"];
    case "work-desk":
      return [...base, "typing or holding a cup", "task-focused seated posture", "casual work moment"];
    case "casual-dinner":
      return [...base, "arriving at table", "holding menu or glass", "soft evening body angle"];
    default:
      return base;
  }
}

function getCameraOptions(scene: SceneTemplate) {
  const selfieScenes = new Set(["mirror-selfie", "car-selfie"]);

  if (selfieScenes.has(scene.id)) {
    return [
      "iphone selfie photo",
      "handheld photo",
      "slightly off-center framing",
      "natural instagram crop",
    ];
  }

  return [
    "iphone photo",
    "handheld lifestyle photo",
    "social media framing",
    "slightly off-center framing",
    "natural lighting",
    "shallow depth of field",
    "natural instagram crop",
  ];
}

function getPoseBlock(scene: SceneTemplate, seed: string) {
  const options = getPoseOptions(scene);
  return [
    pickVariant(`${seed}:pose-a`, options),
    pickVariant(`${seed}:pose-b`, options),
    pickVariant(`${seed}:pose-c`, options),
  ]
    .filter(Boolean)
    .join(", ");
}

function getCameraBlock(scene: SceneTemplate, seed: string) {
  const options = getCameraOptions(scene);
  return [
    pickVariant(`${seed}:camera-a`, options),
    pickVariant(`${seed}:camera-b`, options),
    pickVariant(`${seed}:camera-c`, options),
  ]
    .filter(Boolean)
    .join(", ");
}

export function composeImagePrompt(input: {
  character: Character;
  scene: SceneTemplate;
  customPrompt?: string;
  variantSeed?: string;
}) {
  const { character, scene, customPrompt, variantSeed = `${character.id}:${scene.id}` } = input;

  const blocks = [
    `Create a realistic instagram lifestyle photo of ${character.displayName}.`,
    "",
    `Identity: ${getIdentityBlock(character)}.`,
    `Style: ${styleBlock}.`,
    `Scene: ${getSceneBlock(scene)}.`,
    `Pose: ${getPoseBlock(scene, variantSeed)}.`,
    `Camera: ${getCameraBlock(scene, variantSeed)}.`,
    `Consistency: ${consistencyBlock}.`,
    customPrompt ? `Extra direction: ${customPrompt}.` : null,
    `Negative: ${character.negativePrompt}, ${negativeBlock}.`,
  ];

  return blocks.filter(Boolean).join("\n");
}

export function composeCaptionPrompt(input: {
  character: Character;
  scene: SceneTemplate;
  tone: Character["postingTone"];
}) {
  return [
    `Write three short caption options for ${input.character.displayName}.`,
    `Tone: ${input.tone}.`,
    `Bio context: ${input.character.bio}.`,
    `Scene hint: ${input.scene.captionHint}.`,
    "Keep them natural, social-media friendly, concise, and not overly promotional.",
    "Each option should sound like a real personal post and stay under 18 words.",
  ].join(" ");
}
