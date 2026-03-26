import { StyleMode } from "@/lib/types";

export interface PromptPreset {
  id: string;
  title: string;
  category: string;
  description: string;
  prompt: string;
  modes?: StyleMode[];
  sceneId?: string;
  mode?: StyleMode;
  imageCount?: number;
}

export const promptPresets: PromptPreset[] = [
  {
    id: "flux-street-daylight",
    title: "Flux Street Daylight",
    category: "Flux",
    description: "Daylight city street set with short hair, white shirt, black skirt, and candid lookbook energy.",
    modes: ["lifestyle"],
    mode: "lifestyle",
    sceneId: "city-shopping",
    imageCount: 4,
    prompt:
      "[look:flux-street-daylight] subtle Japanese/Korean street editorial mood, short dark bob or soft short layered hair with light bangs, white button shirt, black pleated mini skirt, black shoulder bag, candid daylight city street photo set, wind movement, clean film realism, not indoor glamour, not bodycon dress, not long evening-hair styling",
  },
  {
    id: "tokyo-street",
    title: "Tokyo Street",
    category: "City",
    description: "Daylight city street set with cleaner candid framing and soft film realism.",
    modes: ["lifestyle", "selfie"],
    prompt:
      "adult East Asian woman, dark hair with soft movement, fair natural skin, realistic anatomy, standing casually on a busy Tokyo street, understated street outfit, soft daylight, candid urban fashion snapshot, subtle Japanese/Korean editorial feel, clean film realism, not glamour portrait",
  },
  {
    id: "cafe-window",
    title: "Cafe Window Seat",
    category: "Cafe",
    description: "Quiet cafe daylight with candid framing and understated style.",
    modes: ["lifestyle", "selfie"],
    prompt:
      "adult East Asian woman, dark hair, fair natural skin, realistic anatomy, sitting by a cafe window with coffee, understated city outfit, natural seated pose, soft daylight, candid lifestyle snapshot, clean film realism, gentle editorial cafe mood",
  },
  {
    id: "poolside-resort",
    title: "Poolside Resort",
    category: "Resort",
    description: "Poolside daylight with cleaner resort styling and candid lookbook energy.",
    modes: ["lifestyle", "sensual"],
    prompt:
      "adult East Asian woman, dark hair, fair natural skin, realistic anatomy, beside a minimalist resort pool, refined resortwear or tasteful swim cover-up, candid three-quarter pose, soft sunlight, premium vacation atmosphere, clean film realism, understated lookbook framing",
  },
  {
    id: "sunset-balcony",
    title: "Sunset Balcony",
    category: "Evening",
    description: "Golden-hour balcony mood with softer candid evening styling.",
    modes: ["lifestyle", "sensual"],
    prompt:
      "adult East Asian woman, dark hair, fair natural skin, realistic anatomy, standing on a balcony during sunset, soft evening outfit with understated silhouette, relaxed candid pose, skyline behind her, warm golden light, subtle film realism, social-media lookbook mood",
  },
  {
    id: "dinner-outing",
    title: "Dinner Outing",
    category: "Evening",
    description: "Evening city look with understated polish and softer candid energy.",
    modes: ["lifestyle", "sensual"],
    prompt:
      "adult East Asian woman, dark hair, fair natural skin, realistic anatomy, arriving at a softly lit dinner spot in the evening, polished but understated outfit, natural confident posture, restaurant lights visible, candid evening city snapshot, subtle cinematic realism",
  },
  {
    id: "morning-bedroom",
    title: "Morning Bedroom",
    category: "Home",
    description: "Soft home daylight with cleaner candid morning framing.",
    modes: ["lifestyle", "sensual"],
    prompt:
      "adult East Asian woman, dark hair, fair natural skin, realistic anatomy, in a softly lit bedroom, oversized white shirt or quiet lounge set, relaxed posture, gentle morning movement, natural window light, candid home snapshot, Korean film morning mood, understated styling, soft film realism",
  },
  {
    id: "mirror-soft-glam",
    title: "Mirror Soft Glam",
    category: "Sensual",
    description: "Mirror setup with understated styling and softer candid tension.",
    modes: ["sensual", "selfie"],
    prompt:
      "adult East Asian woman, dark hair, fair natural skin, realistic anatomy, mirror selfie in a softly lit bedroom, understated fitted casualwear, confident feminine energy, playful but natural expression, iphone selfie photo, slightly imperfect framing, soft film realism, authentic personal post",
  },
  {
    id: "car-casual-selfie",
    title: "Car Casual Selfie",
    category: "Selfie",
    description: "Passenger-seat handheld selfie with natural framing and personal-post energy.",
    modes: ["selfie"],
    prompt:
      "adult East Asian woman, long dark hair, fair natural skin, realistic anatomy, passenger seat selfie, handheld phone angle, casual instagram snapshot, slightly off-center framing, natural daylight through car window, relaxed personal-post expression, authentic iphone photo feel",
  },
  {
    id: "bedroom-phone-selfie",
    title: "Bedroom Phone Selfie",
    category: "Selfie",
    description: "Soft bedroom phone-photo preset with film-like daylight and casual framing.",
    modes: ["selfie"],
    prompt:
      "adult East Asian woman, dark hair, fair natural skin, realistic anatomy, casual bedroom phone selfie, fitted lounge outfit, natural room light, mirror-free handheld photo, slightly imperfect framing, intimate but everyday mood, clean film realism",
  },
  {
    id: "coffee-run-selfie",
    title: "Coffee Run Selfie",
    category: "Selfie",
    description: "Casual out-and-about selfie with coffee and more personal social framing.",
    modes: ["selfie"],
    prompt:
      "adult East Asian woman, long dark hair, fair natural skin, realistic anatomy, handheld selfie while carrying coffee outdoors, casual city background, iphone photo, candid personal post, slightly imperfect crop, natural smile, soft daylight, authentic lifestyle realism",
  },
  {
    id: "window-light-allure",
    title: "Window Light Allure",
    category: "Sensual",
    description: "Soft directional window light with understated indoor styling and clean realism.",
    modes: ["sensual"],
    prompt:
      "adult East Asian woman, dark hair, fair natural skin, realistic anatomy, leaning near a tall window with soft sunlight, fitted loungewear or draped home outfit, relaxed but alluring posture, soft confident gaze, candid indoor lifestyle photo, clean film realism, social media framing",
  },
  {
    id: "rooftop-soft-glam",
    title: "Rooftop Soft Glam",
    category: "Sensual",
    description: "City-night rooftop mood with softer editorial framing and understated polish.",
    modes: ["sensual"],
    prompt:
      "adult East Asian woman, dark hair, fair natural skin, realistic anatomy, rooftop evening portrait with city lights behind, polished evening outfit, relaxed confident posture, looking over shoulder, warm city glow, handheld lifestyle fashion photo, subtle film realism, social framing",
  },
  {
    id: "beach-golden-hour",
    title: "Beach Golden Hour",
    category: "Sensual",
    description: "Golden-hour beach styling with natural movement and cleaner film realism.",
    modes: ["sensual"],
    prompt:
      "adult East Asian woman, dark hair, fair natural skin, realistic anatomy, walking near the beach at sunset, refined summer styling, soft sensual vibe, warm sunlight, hair moved by breeze, candid vacation photo, slightly imperfect framing, clean film realism",
  },
];
