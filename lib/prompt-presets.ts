export interface PromptPreset {
  id: string;
  title: string;
  category: string;
  description: string;
  prompt: string;
}

export const promptPresets: PromptPreset[] = [
  {
    id: "tokyo-street",
    title: "Tokyo Street",
    category: "City",
    description: "Street-style city look with fitted knitwear and candid urban framing.",
    prompt:
      "adult East Asian woman, straight black hair, soft bangs, fair skin, expressive eyes, slim waist, softly curvy feminine silhouette, realistic anatomy, standing casually on a busy Tokyo street, wearing a fitted ribbed knit top with a flattering neckline and high-waisted shorts, natural urban pose, lively city background, soft daylight, candid street fashion photography, authentic lifestyle realism, premium social media framing",
  },
  {
    id: "cafe-window",
    title: "Cafe Window Seat",
    category: "Cafe",
    description: "Polished cafe mood with flattering knitwear and clean daylight.",
    prompt:
      "adult East Asian woman, long dark hair, fair natural skin, softly curvy feminine silhouette, realistic anatomy, sitting by a cafe window, wearing a fitted black ribbed knit top with a flattering neckline and high-waisted skirt or shorts, natural seated pose, coffee on the table, soft daylight, city lifestyle mood, candid street-style photography, authentic skin texture, stylish feminine silhouette, premium Instagram aesthetic",
  },
  {
    id: "poolside-resort",
    title: "Poolside Resort",
    category: "Resort",
    description: "Refined poolside styling with a feminine silhouette and resort light.",
    prompt:
      "adult East Asian woman, long dark hair, fair natural skin, softly curvy feminine silhouette, fuller upper-body line, slim waist, toned legs, realistic anatomy, beside a minimalist resort pool, wearing refined resortwear or tasteful swim cover-up, flattering three-quarter pose, elegant seated posture, soft sunlight, premium vacation atmosphere, natural feminine silhouette, realistic lifestyle photography, clean luxury background, warm skin tones, candid premium composition",
  },
  {
    id: "sunset-balcony",
    title: "Sunset Balcony",
    category: "Evening",
    description: "Golden-hour balcony mood with a fitted evening silhouette.",
    prompt:
      "adult East Asian woman, long dark hair, fair natural skin, expressive eyes, slim waist, softly curvy feminine silhouette, realistic anatomy, standing on a balcony during sunset, wearing a fitted evening dress with soft drape and flattering neckline, elegant relaxed pose, skyline behind her, golden-hour light, warm cinematic tones, candid luxury lifestyle photo, natural body proportions, premium social media composition",
  },
  {
    id: "dinner-outing",
    title: "Dinner Outing",
    category: "Evening",
    description: "Refined dinner look with softly glamorous city styling.",
    prompt:
      "adult East Asian woman, long dark hair, fair natural skin, slim waist, softly curvy feminine silhouette, realistic anatomy, arriving at a softly lit dinner spot in the evening, wearing an elegant fitted dress, refined feminine styling, natural confident posture, restaurant lights and table setting visible, candid evening lifestyle photography, warm tones, premium social media composition",
  },
  {
    id: "morning-bedroom",
    title: "Morning Bedroom",
    category: "Home",
    description: "Warm bedroom lifestyle scene with elegant lounge styling.",
    prompt:
      "adult East Asian woman, long dark hair, fair natural skin, expressive eyes, softly curvy feminine silhouette, slim waist, realistic anatomy, in a softly lit bedroom, wearing an oversized white shirt or elegant lounge set, sitting on the bed with relaxed posture, gentle morning stretch, slightly tousled hair, natural window light, warm cozy atmosphere, candid lifestyle photography, Korean film morning mood, 50mm lens, shallow depth of field, soft warm tones, authentic social media lifestyle photo",
  },
];
