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
    `Scene: ${scene.promptTemplate}.`,
    `Style direction: ${character.stylePrompt}.`,
    customPrompt ? `Custom direction: ${customPrompt}.` : null,
    realismDirection,
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
