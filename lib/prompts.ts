import { Character, SceneTemplate } from "@/lib/types";

const realismDirection = [
  "Prioritize highly realistic lifestyle photography.",
  "The persona should look natural, human, and visually consistent across images.",
  "Use natural light, realistic skin texture, candid framing, and social-media-friendly composition.",
  "Preserve believable facial features, hands, body proportions, and camera perspective.",
  "Treat the reference image only as an identity anchor for the same face and general appearance.",
  "Do not reuse the same pose, outfit, background, framing, crop, or body position from the reference image.",
  "Create a genuinely new moment with scene-appropriate posture, hand placement, camera angle, expression, and environment details.",
  "Make the selected scene clearly visible so the background and activity read as a different setting, not just a wardrobe change.",
].join(" ");

const realismNegativeDirection = [
  "Avoid exaggerated AI beauty, plastic skin, distorted hands, extra fingers, over-sharpening, fake HDR, uncanny facial symmetry, overly glossy textures, synthetic lighting, waxy skin, and over-retouched details.",
].join(" ");

function getSceneActionDirection(scene: SceneTemplate) {
  switch (scene.id) {
    case "morning-coffee":
      return "Action and pose: standing or leaning by a kitchen counter, lifting a mug, looking away from camera, relaxed morning posture.";
    case "kitchen-cooking":
      return "Action and pose: active cooking movement, reaching for ingredients, side profile or three-quarter angle, natural hand interaction with kitchen objects.";
    case "cafe-window":
      return "Action and pose: seated at a cafe table or turning toward the window, one hand near a cup or book, candid urban pause rather than posed portrait.";
    case "bookstore":
      return "Action and pose: walking between shelves, pulling out a book, glancing down at pages, documentary-style browsing posture.";
    case "beach-walk":
      return "Action and pose: walking along the shoreline, hair and clothing affected by breeze, full-body or medium-wide shot with movement.";
    case "poolside":
      return "Action and pose: lounging by the pool edge or adjusting sunglasses/towel, resort posture, visible water and pool furniture in frame.";
    case "city-shopping":
      return "Action and pose: walking across a sidewalk, holding shopping bags, mid-step street-style composition with visible storefronts.";
    case "mirror-selfie":
      return "Action and pose: upright standing mirror selfie, phone visible, apartment details reflected clearly, casual self-capture energy.";
    case "sunset-balcony":
      return "Action and pose: standing at balcony railing, looking toward skyline, backlit sunset atmosphere, medium or wide framing.";
    case "casual-gym":
      return "Action and pose: walking through gym floor, adjusting ponytail or water bottle, active athleisure posture, visible equipment behind.";
    case "weekend-brunch":
      return "Action and pose: seated at brunch table, reaching for cutlery or coffee, natural conversation-like posture, food visible.";
    case "reading-sofa":
      return "Action and pose: reclining or curled up on sofa, holding an open book, layered indoor composition with blankets or cushions.";
    case "airport-waiting":
      return "Action and pose: sitting near large terminal windows or walking with luggage, travel posture, bags and airport seating visible.";
    case "hotel-morning":
      return "Action and pose: standing near hotel curtains or moving across the room, soft wake-up routine, room details visible.";
    case "car-selfie":
      return "Action and pose: seated in passenger seat, phone angle from arm’s length, dashboard and window context visible.";
    case "rainy-window":
      return "Action and pose: standing close to a rain-streaked window, contemplative profile or three-quarter pose, moody weather context.";
    case "garden-afternoon":
      return "Action and pose: walking through garden path or pausing near flowers, natural outdoor movement, wider environmental framing.";
    case "rooftop-evening":
      return "Action and pose: leaning on terrace rail or turning toward city lights, dusk atmosphere, skyline clearly visible.";
    case "work-desk":
      return "Action and pose: working at desk, typing on laptop or reviewing notes, seated work posture with screen, coffee, and desk objects visible.";
    case "casual-dinner":
      return "Action and pose: arriving at table, holding menu or glass, evening social posture, restaurant lighting and table setting visible.";
    default:
      return `Action and pose: ${scene.promptTemplate}.`;
  }
}

function getSceneCameraDirection(scene: SceneTemplate) {
  switch (scene.category) {
    case "travel":
      return "Camera and framing: medium-wide or full-body travel editorial framing, clear environmental context, not a static studio portrait.";
    case "city":
      return "Camera and framing: street-style candid composition, three-quarter or full-body framing, architecture or storefronts visible.";
    case "cafe":
      return "Camera and framing: over-table or side-angle candid shot with table objects and window light included.";
    case "home":
      return "Camera and framing: lived-in interior composition, medium or wide frame with room context, avoid plain blank-wall portrait crops.";
    case "wellness":
      return "Camera and framing: active candid angle with visible equipment and body posture, avoid static seated posing.";
    case "work":
      return "Camera and framing: desk-level editorial angle with workspace objects visible, natural task-focused composition.";
    case "outdoor":
      return "Camera and framing: wider environmental outdoor portrait with natural depth and visible landscape details.";
    default:
      return "Camera and framing: candid lifestyle framing with a clear sense of place and activity.";
  }
}

function getSceneVariationDirection(scene: SceneTemplate) {
  return [
    `Scene target: ${scene.title}.`,
    `Environment anchor: ${scene.promptTemplate}.`,
    getSceneActionDirection(scene),
    getSceneCameraDirection(scene),
    "Background must clearly match the chosen scene and be visually different from the reference image location.",
    "Body position, hand placement, facial expression, crop, and camera angle should all be reinterpreted for this scene.",
  ].join(" ");
}

export function composeImagePrompt(input: {
  character: Character;
  scene: SceneTemplate;
  customPrompt?: string;
}) {
  const { character, scene, customPrompt } = input;
  const sections = [
    `Create a realistic lifestyle portrait of ${character.displayName}.`,
    `Appearance: ${character.appearanceDescription}.`,
    `Identity and vibe: ${character.identityStyle}, ${character.vibe}.`,
    `Location context: ${character.city}.`,
    getSceneVariationDirection(scene),
    `Style direction: ${character.stylePrompt}.`,
    customPrompt ? `Custom direction: ${customPrompt}.` : null,
    realismDirection,
    "If the reference image is seated indoors, do not default back to seated indoors unless the chosen scene explicitly requires it.",
    "Prioritize a new composition over preserving the original reference photo layout.",
    `Keep it platform-safe, premium, natural, and consistent with the same persona.`,
    `Negative prompt: ${character.negativePrompt}. ${realismNegativeDirection}`,
  ];

  return sections.filter(Boolean).join(" ");
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
