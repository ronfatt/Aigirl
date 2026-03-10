import { Character, SceneTemplate } from "@/lib/types";

const realismDirection = [
  "Prioritize highly realistic lifestyle photography.",
  "The persona should look natural, human, and visually consistent across images.",
  "Use natural light, realistic skin texture, candid framing, and social-media-friendly composition.",
  "Preserve believable facial features, hands, body proportions, and camera perspective.",
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
