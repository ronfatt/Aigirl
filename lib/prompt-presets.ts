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
    description: "Street-style city look with fitted knitwear and candid urban framing.",
    modes: ["lifestyle", "selfie"],
    prompt:
      "adult East Asian woman, straight black hair, soft bangs, fair skin, expressive eyes, slim waist, softly curvy feminine silhouette, realistic anatomy, standing casually on a busy Tokyo street, wearing a fitted ribbed knit top with a flattering neckline and high-waisted shorts, natural urban pose, lively city background, soft daylight, candid street fashion photography, authentic lifestyle realism, premium social media framing",
  },
  {
    id: "cafe-window",
    title: "Cafe Window Seat",
    category: "Cafe",
    description: "Polished cafe mood with flattering knitwear and clean daylight.",
    modes: ["lifestyle", "selfie"],
    prompt:
      "adult East Asian woman, long dark hair, fair natural skin, softly curvy feminine silhouette, realistic anatomy, sitting by a cafe window, wearing a fitted black ribbed knit top with a flattering neckline and high-waisted skirt or shorts, natural seated pose, coffee on the table, soft daylight, city lifestyle mood, candid street-style photography, authentic skin texture, stylish feminine silhouette, premium Instagram aesthetic",
  },
  {
    id: "poolside-resort",
    title: "Poolside Resort",
    category: "Resort",
    description: "Refined poolside styling with a feminine silhouette and resort light.",
    modes: ["lifestyle", "sensual"],
    prompt:
      "adult East Asian woman, long dark hair, fair natural skin, softly curvy feminine silhouette, fuller upper-body line, slim waist, toned legs, realistic anatomy, beside a minimalist resort pool, wearing refined resortwear or tasteful swim cover-up, flattering three-quarter pose, elegant seated posture, soft sunlight, premium vacation atmosphere, natural feminine silhouette, realistic lifestyle photography, clean luxury background, warm skin tones, candid premium composition",
  },
  {
    id: "sunset-balcony",
    title: "Sunset Balcony",
    category: "Evening",
    description: "Golden-hour balcony mood with a fitted evening silhouette.",
    modes: ["lifestyle", "sensual"],
    prompt:
      "adult East Asian woman, long dark hair, fair natural skin, expressive eyes, slim waist, softly curvy feminine silhouette, realistic anatomy, standing on a balcony during sunset, wearing a fitted evening dress with soft drape and flattering neckline, elegant relaxed pose, skyline behind her, golden-hour light, warm cinematic tones, candid luxury lifestyle photo, natural body proportions, premium social media composition",
  },
  {
    id: "dinner-outing",
    title: "Dinner Outing",
    category: "Evening",
    description: "Refined dinner look with softly glamorous city styling.",
    modes: ["lifestyle", "sensual"],
    prompt:
      "adult East Asian woman, long dark hair, fair natural skin, slim waist, softly curvy feminine silhouette, realistic anatomy, arriving at a softly lit dinner spot in the evening, wearing an elegant fitted dress, refined feminine styling, natural confident posture, restaurant lights and table setting visible, candid evening lifestyle photography, warm tones, premium social media composition",
  },
  {
    id: "morning-bedroom",
    title: "Morning Bedroom",
    category: "Home",
    description: "Warm bedroom lifestyle scene with elegant lounge styling.",
    modes: ["lifestyle", "sensual"],
    prompt:
      "adult East Asian woman, long dark hair, fair natural skin, expressive eyes, softly curvy feminine silhouette, slim waist, realistic anatomy, in a softly lit bedroom, wearing an oversized white shirt or elegant lounge set, sitting on the bed with relaxed posture, gentle morning stretch, slightly tousled hair, natural window light, warm cozy atmosphere, candid lifestyle photography, Korean film morning mood, 50mm lens, shallow depth of field, soft warm tones, authentic social media lifestyle photo",
  },
  {
    id: "mirror-soft-glam",
    title: "Mirror Soft Glam",
    category: "Sensual",
    description: "Bedroom mirror styling with fitted casualwear and a confident, feminine feel.",
    modes: ["sensual", "selfie"],
    prompt:
      "adult East Asian woman, long dark hair, fair natural skin, softly curvy feminine silhouette, realistic anatomy, mirror selfie in a softly lit bedroom, fitted crop knit or elegant casual top, high-waisted skirt or shorts, confident feminine energy, soft sensual vibe, playful but natural expression, iphone selfie photo, slightly imperfect framing, authentic personal post realism",
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
    description: "Soft bedroom phone-photo preset with natural room light and candid framing.",
    modes: ["selfie"],
    prompt:
      "adult East Asian woman, long dark hair, fair natural skin, softly curvy feminine silhouette, realistic anatomy, casual bedroom phone selfie, fitted lounge outfit, natural room light, candid mirror-free handheld photo, slightly imperfect framing, intimate but everyday mood, realistic skin texture",
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
    description: "Soft directional window light with a relaxed, more alluring indoor pose.",
    modes: ["sensual"],
    prompt:
      "adult East Asian woman, long dark hair, fair natural skin, slim waist, softly curvy feminine silhouette, realistic anatomy, leaning near a tall window with soft sunlight, fitted loungewear or draped home outfit, relaxed but alluring posture, subtle body curve, soft confident gaze, warm natural light, candid indoor lifestyle photo, realistic skin texture, social media framing",
  },
  {
    id: "rooftop-soft-glam",
    title: "Rooftop Soft Glam",
    category: "Sensual",
    description: "City-night rooftop mood with more polish and a confident silhouette.",
    modes: ["sensual"],
    prompt:
      "adult East Asian woman, long dark hair, fair natural skin, softly curvy feminine silhouette, realistic anatomy, rooftop evening portrait with city lights behind, fitted dress or polished evening set, soft glamour styling, relaxed confident posture, looking over shoulder, warm city glow, handheld lifestyle fashion photo, natural body proportions, premium social framing",
  },
  {
    id: "beach-golden-hour",
    title: "Beach Golden Hour",
    category: "Sensual",
    description: "Golden-hour beach styling with softer summer sensuality and movement.",
    modes: ["sensual"],
    prompt:
      "adult East Asian woman, long dark hair, fair natural skin, slim waist, softly curvy feminine silhouette, realistic anatomy, walking near the beach at sunset, refined summer styling, soft sensual vibe, warm sunlight, hair moved by breeze, subtle body curve, candid vacation photo, slightly imperfect framing, authentic lifestyle realism",
  },
];
