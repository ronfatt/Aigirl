import { Character, SceneTemplate } from "@/lib/types";

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
    `Keep it platform-safe, premium, natural, and consistent with the same persona.`,
    `Negative prompt: ${character.negativePrompt}.`,
  ];

  return sections.filter(Boolean).join(" ");
}

export function composeCaptionPrompt(input: {
  character: Character;
  scene: SceneTemplate;
  tone: Character["postingTone"];
}) {
  return [
    `Write one short caption for ${input.character.displayName}.`,
    `Tone: ${input.tone}.`,
    `Bio context: ${input.character.bio}.`,
    `Scene hint: ${input.scene.captionHint}.`,
    `Keep it social-friendly, natural, and under 18 words.`,
  ].join(" ");
}
