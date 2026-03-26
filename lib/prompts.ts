import { Character, Platform, SceneTemplate, SensualPoseBias, ShotType, StyleMode } from "@/lib/types";

const styleBlocks: Record<StyleMode, string> = {
  lifestyle: [
    "instagram influencer lifestyle photo",
    "soft attractive vibe",
    "girl next door aesthetic",
    "candid lifestyle moment",
    "casual moment",
    "casual instagram snapshot",
    "slightly imperfect",
    "natural sunlight",
    "realistic skin texture",
    "tiny skin details",
    "natural feminine silhouette",
    "realistic body proportions",
  ].join(", "),
  selfie: [
    "realistic instagram selfie photo",
    "natural personal-post energy",
    "casual snapshot",
    "intimate but everyday mood",
    "slightly imperfect",
    "natural skin texture",
    "tiny skin details",
    "soft flattering light",
    "realistic body proportions",
  ].join(", "),
  sensual: [
    "sensual lifestyle photo",
    "soft sensual vibe",
    "confident feminine energy",
    "alluring but natural expression",
    "soft glamour lifestyle photo",
    "warm sunlight",
    "natural skin texture",
    "tiny skin details",
    "subtle body curve",
    "realistic body proportions",
    "tasteful styling",
  ].join(", "),
};

const consistencyBlock =
  "maintain the same facial identity across images, same person, same face, same hairline, same eye shape";

function getIdentityLockBlock(character: Character) {
  if (character.identityLockStrength === "max") {
    return "prioritize identity consistency strongly, keep the same face, same facial proportions, same hairline, and same overall look before adding scene variation";
  }

  if (character.identityLockStrength === "high") {
    return "keep the same face and overall identity strongly while still allowing moderate scene and pose variation";
  }

  return "keep the same face identity while still allowing healthy scene, camera, and pose variation";
}

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

function extractLookMarker(prompt?: string) {
  if (!prompt) {
    return { lookMarker: null, cleanedPrompt: "" };
  }

  const match = prompt.match(/^\[look:([^\]]+)\]\s*/);

  if (!match) {
    return { lookMarker: null, cleanedPrompt: prompt.trim() };
  }

  return {
    lookMarker: match[1] ?? null,
    cleanedPrompt: prompt.replace(/^\[look:[^\]]+\]\s*/, "").trim(),
  };
}

function getIdentityBlock(character: Character) {
  return [
    `${character.displayName} is an adult ${character.identityStyle} woman living in ${character.city}.`,
    character.appearanceDescription,
    character.vibe,
    character.faceReferenceImageUrl ? "keep the same face identity as the face reference" : "",
    character.styleReferenceImageUrl ? "keep the same hair, styling mood, and beauty direction as the style reference" : "",
    character.bodyReferenceImageUrl ? "keep a similar body shape, silhouette, and posture feel from the body reference" : "",
  ]
    .filter(Boolean)
    .join(", ");
}

function getLookProfileBlock(character: Character) {
  switch (character.lookProfile) {
    case "flux-street":
      return "default visual lane: daylight city street fashion, cleaner editorial candid energy, short dark street-style hair direction, understated film realism";
    case "soft-home":
      return "default visual lane: indoor natural light, soft home styling, calm candid domestic moments, warm neutral tones";
    case "night-city":
      return "default visual lane: urban evening glow, darker polished styling, neon blur, cinematic city-night atmosphere";
    default:
      return "default visual lane: stay flexible and let the scene define the styling";
  }
}

function getSceneBlock(scene: SceneTemplate) {
  return scene.promptTemplate;
}

function getFluxStreetSceneBlock(scene: SceneTemplate) {
  return [
    "soft daylight city street",
    "concrete wall or sidewalk edge",
    "passing cars and gentle urban blur in background",
    "candid street fashion moment",
    scene.promptTemplate,
  ].join(", ");
}

function getFluxStreetReferenceBlock(character: Character) {
  return [
    "Reference priority: keep the same facial identity first",
    character.faceReferenceImageUrl
      ? "follow the face reference for eyes, jawline, nose, and overall recognizability"
      : "keep the same face identity from the main persona reference",
    "style direction should lean toward short dark street-style hair or a soft bob with light bangs",
    "avoid drifting back into long glamorous indoor-hair styling",
    "body shape should stay natural, slim, and understated rather than overtly glam",
  ].join(", ");
}

function getSensualSceneAccent(scene: SceneTemplate) {
  switch (scene.id) {
    case "mirror-selfie":
      return "mirror selfie in a softly lit bedroom with a fitted casual outfit";
    case "hotel-morning":
      return "sitting on a neatly styled bed in warm morning light with elegant lounge styling";
    case "sunset-balcony":
      return "balcony sunset moment in a summer dress with warm evening glow";
    case "poolside":
      return "poolside relaxing in refined swim cover styling with premium resort mood";
    case "beach-walk":
      return "beach sunset walk with warm light, soft breeze, and confident summer energy";
    case "reading-sofa":
      return "lounging on a sofa in a fitted casual outfit with soft window light";
    case "rainy-window":
      return "leaning near a window with soft directional light and cinematic intimacy";
    case "rooftop-evening":
      return "night city lights balcony photo with softly glamorous styling";
    default:
      return scene.promptTemplate;
  }
}

function getSensualBiasOptions(bias: SensualPoseBias) {
  switch (bias) {
    case "playful":
      return [
        "slightly playful expression",
        "soft laugh moment",
        "teasing eye contact",
        "light hair movement",
      ];
    case "confident":
      return [
        "confident feminine gaze",
        "relaxed poised posture",
        "looking over shoulder",
        "strong but natural presence",
      ];
    default:
      return [
        "soft smile with confident gaze",
        "subtle body curve",
        "gentle feminine expression",
        "soft glamour posture",
      ];
  }
}

function getPoseOptions(scene: SceneTemplate, mode: StyleMode, sensualPoseBias: SensualPoseBias) {
  const base = mode === "sensual"
    ? [
        "relaxed but alluring posture",
        ...getSensualBiasOptions(sensualPoseBias),
        "leaning slightly forward",
        "playing with hair",
        "looking over shoulder",
        "avoid explicit posing",
      ]
    : [
    "relaxed posture",
    "subtle body curve",
    "natural smile or playful expression",
    "avoid professional model poses",
    "looking away from camera",
    "leaning slightly forward",
    "adjusting hair",
    "soft laugh moment",
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
      return [...base, "mid-step walking pose", "holding shopping bags", "off-center candid body angle", "walking naturally"];
    case "mirror-selfie":
      return [...base, "casual selfie angle", "phone visible in frame", "standing mirror pose", "taking mirror selfie"];
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
      return mode === "sensual"
        ? [...base, "soft confident expression", "slightly turning body", "natural curve emphasis"]
        : base;
  }
}

function getCameraOptions(scene: SceneTemplate, mode: StyleMode) {
  const selfieScenes = new Set(["mirror-selfie", "car-selfie"]);

  if (selfieScenes.has(scene.id)) {
    return mode === "sensual"
      ? [
          "iphone selfie photo",
          "handheld shot",
          "casual instagram photo",
          "slightly imperfect framing",
          "soft lighting",
          "social media photo",
          "natural instagram crop",
        ]
      : [
      "iphone selfie photo",
      "handheld shot",
      "casual instagram photo",
      "slightly off-center framing",
      "slightly imperfect framing",
      "natural instagram crop",
      ];
  }

  return mode === "sensual"
    ? [
        "iphone selfie photo or lifestyle fashion photo",
        "handheld shot",
        "soft lighting",
        "social media photo",
        "slightly imperfect framing",
        "natural lighting",
        "shallow depth of field",
        "natural instagram crop",
      ]
    : [
    "iphone photo",
    "handheld shot",
    "casual instagram photo",
    "casual snapshot",
    "social media framing",
    "slightly off-center framing",
    "slightly imperfect framing",
    "over the shoulder shot",
    "natural lighting",
    "shallow depth of field",
    "natural instagram crop",
    ];
}

function getPoseBlock(
  scene: SceneTemplate,
  seed: string,
  mode: StyleMode,
  sensualPoseBias: SensualPoseBias,
) {
  const options = getPoseOptions(scene, mode, sensualPoseBias);
  return [
    pickVariant(`${seed}:pose-a`, options),
    pickVariant(`${seed}:pose-b`, options),
    pickVariant(`${seed}:pose-c`, options),
  ]
    .filter(Boolean)
    .join(", ");
}

function getCameraBlock(scene: SceneTemplate, seed: string, mode: StyleMode) {
  const options = getCameraOptions(scene, mode);
  return [
    pickVariant(`${seed}:camera-a`, options),
    pickVariant(`${seed}:camera-b`, options),
    pickVariant(`${seed}:camera-c`, options),
  ]
    .filter(Boolean)
    .join(", ");
}

function getShotBlock(shotType: ShotType) {
  switch (shotType) {
    case "close":
      return "portrait close-up, face and upper torso in frame, avoid chest-only crop";
    case "full-body":
      return "full-body framing, complete silhouette visible, avoid tight crop";
    case "three-quarter":
      return "three-quarter body framing, from head to below knees, avoid tight bust crop";
    default:
      return "half-body framing, from head to waist, balanced composition, avoid chest-only crop";
  }
}

function getFluxStreetPoseBlock(shotType: ShotType, seed: string) {
  const byShot: Record<ShotType, string[]> = {
    close: [
      "closer face crop with wind-touched bangs and calm direct gaze",
      "slight turn back toward camera with soft serious expression",
      "casual daylight portrait from a street photo set",
    ],
    "half-body": [
      "standing near a concrete wall, subtle turn back toward camera",
      "bag visible on shoulder, relaxed posture, natural expression",
      "caught between movement and pause, candid street snapshot",
    ],
    "three-quarter": [
      "mid-step walking angle with skirt movement and natural body turn",
      "hair moved by breeze, city street behind",
      "street-style lookbook frame with clean daylight",
    ],
    "full-body": [
      "full outfit visible while walking near curb or crosswalk",
      "head turned slightly back toward camera",
      "natural urban movement with candid fashion energy",
    ],
  };

  const options = byShot[shotType] ?? byShot["half-body"];
  return [
    pickVariant(`${seed}:flux-pose-a`, options),
    pickVariant(`${seed}:flux-pose-b`, options),
    pickVariant(`${seed}:flux-pose-c`, options),
  ]
    .filter(Boolean)
    .join(", ");
}

function getFluxStreetCameraBlock(seed: string) {
  const options = [
    "casual handheld street snapshot",
    "clean daylight film realism",
    "slightly imperfect framing",
    "soft natural depth of field",
    "social media lookbook photo",
    "subtle editorial street framing",
  ];

  return [
    pickVariant(`${seed}:flux-camera-a`, options),
    pickVariant(`${seed}:flux-camera-b`, options),
    pickVariant(`${seed}:flux-camera-c`, options),
  ]
    .filter(Boolean)
    .join(", ");
}

function getFluxStreetSeriesBlock(imageCount: number) {
  const sequence = [
    "frame 1: a hero street frame with turn-back eye contact near a concrete wall",
    "frame 2: a candid half-body or seated street-side frame with softer expression",
    "frame 3: a cleaner near-face crop with wind movement and city blur",
    "frame 4: a three-quarter or full-body walking frame showing the outfit and shoulder bag",
    "frame 5: an alternate angle from the side or back to complete the carousel",
  ];

  return sequence.slice(0, Math.max(1, Math.min(imageCount, sequence.length))).join("; ");
}

export function composeImagePrompt(input: {
  character: Character;
  scene: SceneTemplate;
  customPrompt?: string;
  variantSeed?: string;
  mode?: StyleMode;
  sensualPoseBias?: SensualPoseBias;
  shotType?: ShotType;
  imageCount?: number;
}) {
  const {
    character,
    scene,
    customPrompt,
    variantSeed = `${character.id}:${scene.id}`,
    mode = "lifestyle",
    sensualPoseBias = "soft glam",
    shotType = "half-body",
    imageCount = 1,
  } = input;
  const { lookMarker, cleanedPrompt } = extractLookMarker(customPrompt);
  const sceneBlock = mode === "sensual" ? getSensualSceneAccent(scene) : getSceneBlock(scene);
  const opener =
    mode === "sensual"
      ? `Create a realistic sensual lifestyle photo of ${character.displayName}.`
      : mode === "selfie"
        ? `Create a realistic instagram selfie photo of ${character.displayName}.`
        : `Create a realistic instagram lifestyle photo of ${character.displayName}.`;

  if (lookMarker === "flux-street-daylight") {
    const blocks = [
      `Create a realistic Flux-style street photo of ${character.displayName}.`,
      "",
      `Identity: adult East Asian woman, keep the same face identity, ${character.appearanceDescription}.`,
      `${getLookProfileBlock(character)}.`,
      `${getFluxStreetReferenceBlock(character)}.`,
      "Style: clean daylight street photo, soft film realism, candid editorial street snapshot, subtle Japanese/Korean fashion feel, natural skin texture, understated makeup, not studio glamour.",
      "Wardrobe: white button shirt, black pleated mini skirt, black shoulder bag, simple polished city styling.",
      `Scene: ${getFluxStreetSceneBlock(scene)}.`,
      `Pose: ${getFluxStreetPoseBlock(shotType, variantSeed)}.`,
      `Camera: ${getFluxStreetCameraBlock(variantSeed)}.`,
      "Color grade: low saturation daylight neutrals, soft city tones, gentle film softness, realistic contrast.",
      `Shot: ${getShotBlock(shotType)}.`,
      `Series direction: create a cohesive ${imageCount}-image street carousel. ${getFluxStreetSeriesBlock(imageCount)}.`,
      `Consistency: ${consistencyBlock}.`,
      `Identity lock: ${getIdentityLockBlock(character)}.`,
      cleanedPrompt ? `Extra direction: ${cleanedPrompt}.` : null,
      "Negative: indoor glamour portrait, bodycon pink dress, long evening hair, over-smoothed skin, heavy retouching, perfect model pose, studio lighting, plastic skin.",
    ];

    return blocks.filter(Boolean).join("\n");
  }

  if (mode === "sensual") {
    const simplifiedNegative = [
      character.negativePrompt,
      "studio lighting",
      "glamour photography",
      "supermodel pose",
    ]
      .filter(Boolean)
      .join(", ");

    const blocks = [
      `Realistic iphone photo of ${character.displayName}.`,
      "",
      getIdentityBlock(character),
      "",
      "soft sensual vibe,",
      "natural feminine curves,",
      "playful confident expression.",
      "",
      `Scene: ${sceneBlock}.`,
      "",
      `Pose: ${getPoseBlock(scene, variantSeed, mode, sensualPoseBias)}.`,
      "",
      `Look profile: ${getLookProfileBlock(character)}.`,
      "",
      "Lighting:",
      "soft morning sunlight.",
      "",
      "Camera:",
      `${getCameraBlock(scene, variantSeed, mode)}.`,
      "",
      `Shot: ${getShotBlock(shotType)}.`,
      "",
      "Keep the same face identity.",
      `${getIdentityLockBlock(character)}.`,
      cleanedPrompt ? `Extra direction: ${cleanedPrompt}.` : null,
      "",
      `Negative: ${simplifiedNegative}.`,
    ];

    return blocks.filter(Boolean).join("\n");
  }

  const blocks = [
    opener,
    "",
    `Identity: ${getIdentityBlock(character)}.`,
    `Look profile: ${getLookProfileBlock(character)}.`,
    `Style: ${styleBlocks[mode]}.`,
    `Scene: ${sceneBlock}.`,
    `Pose: ${getPoseBlock(scene, variantSeed, mode, sensualPoseBias)}.`,
    `Camera: ${getCameraBlock(scene, variantSeed, mode)}.`,
    `Shot: ${getShotBlock(shotType)}.`,
    `Consistency: ${consistencyBlock}.`,
    `Identity lock: ${getIdentityLockBlock(character)}.`,
    cleanedPrompt ? `Extra direction: ${cleanedPrompt}.` : null,
    `Negative: ${character.negativePrompt}, ${negativeBlock}.`,
  ];

  return blocks.filter(Boolean).join("\n");
}

export function composeCaptionPrompt(input: {
  character: Character;
  scene: SceneTemplate;
  tone: Character["postingTone"];
  platform: Exclude<Platform, "both">;
}) {
  const toneGuide =
    input.tone === "soft lifestyle"
      ? "Keep the voice gentle, observant, and warm."
      : input.tone === "casual intimate"
        ? "Keep the voice close, personal, and lightly intimate without sounding explicit."
        : input.tone === "playful"
          ? "Keep the voice lightly teasing, self-aware, and charming."
          : "Keep the voice polished, understated, and quietly confident.";

  if (input.platform === "facebook") {
    return [
      `Write three Facebook post options for ${input.character.displayName}.`,
      `Tone: ${input.tone}.`,
      `Bio context: ${input.character.bio}.`,
      `Scene hint: ${input.scene.captionHint}.`,
      "Write in a personal, lifestyle-sharing voice as if she is reflecting on a small moment from her day.",
      "Each option should be 3 to 5 sentences, warm, specific, and natural.",
      toneGuide,
      "Make the three options distinct:",
      "Option 1 should feel like a soft diary entry.",
      "Option 2 should feel like a slightly intimate diary reflection with a little emotional pull.",
      "Option 3 should feel like a reflective personal share that can end with a light, natural question.",
      "Include one or two concrete life details and a soft reflection.",
      "Avoid generic motivational language and avoid repeating the same opening rhythm across options.",
      "Avoid sounding promotional, generic, or like influencer marketing copy.",
    ].join(" ");
  }

  return [
    `Write three Instagram caption options for ${input.character.displayName}.`,
    `Tone: ${input.tone}.`,
    `Bio context: ${input.character.bio}.`,
    `Scene hint: ${input.scene.captionHint}.`,
    "Keep them natural, social-media friendly, concise, and slightly magnetic.",
    toneGuide,
    "Make the three options distinct:",
    "Option 1 should be a soft tease.",
    "Option 2 should be a quiet mood line with subtext.",
    "Option 3 should feel like confident allure without sounding explicit.",
    "Avoid generic filler like 'just vibes', 'main character energy', or obvious influencer clichés.",
    "Each option should sound like a real personal post and stay under 22 words.",
  ].join(" ");
}
