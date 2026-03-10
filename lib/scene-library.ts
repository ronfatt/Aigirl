import { SceneTemplate } from "@/lib/types";

const now = new Date().toISOString();

export const sceneLibrary: SceneTemplate[] = [
  ["morning-coffee", "Morning Coffee at Home", "home", "holding a ceramic mug near a bright kitchen window", "slow start, warm light", "safe"],
  ["kitchen-cooking", "Kitchen Cooking", "home", "preparing a casual breakfast in a modern kitchen", "small domestic rituals", "safe"],
  ["cafe-window", "Cafe Window Seat", "cafe", "sitting by a cafe window with natural daylight", "city pause, soft mood", "safe"],
  ["bookstore", "Bookstore Browsing", "city", "looking through art and design books in a boutique bookstore", "quiet discovery", "safe"],
  ["beach-walk", "Beach Walk", "travel", "walking barefoot near the shoreline at golden hour", "coastal ease", "suggestive"],
  ["poolside", "Poolside Relaxing", "travel", "lounging near a minimalist pool with resort styling", "sunny calm", "suggestive"],
  ["city-shopping", "City Shopping", "city", "carrying shopping bags along a stylish downtown street", "weekend city energy", "safe"],
  ["mirror-selfie", "Mirror Selfie at Home", "home", "taking a mirror selfie in a clean apartment interior", "personal diary feel", "suggestive"],
  ["sunset-balcony", "Sunset Balcony", "home", "standing on a balcony during sunset with skyline behind", "after-hours mood", "safe"],
  ["casual-gym", "Casual Gym Visit", "wellness", "walking through a boutique gym in stylish athleisure", "light fitness vibe", "safe"],
  ["weekend-brunch", "Weekend Brunch", "cafe", "sharing a relaxed brunch table with soft daylight", "slow weekend", "safe"],
  ["reading-sofa", "Reading on Sofa", "home", "reading on a textured sofa with layered blankets", "calm indoor moment", "safe"],
  ["airport-waiting", "Airport Waiting Area", "travel", "sitting near an airport window with luggage", "between cities", "safe"],
  ["hotel-morning", "Hotel Room Morning Light", "travel", "soft morning light in a boutique hotel room", "quiet luxury", "suggestive"],
  ["car-selfie", "Car Passenger Seat Selfie", "travel", "capturing a natural selfie from the passenger seat", "on the move", "safe"],
  ["rainy-window", "Rainy Day Window Portrait", "home", "standing by a rain-covered window in moody light", "cinematic weather", "safe"],
  ["garden-afternoon", "Garden Afternoon", "outdoor", "walking through a private garden in afternoon sun", "weekend softness", "safe"],
  ["rooftop-evening", "Rooftop Evening", "city", "leaning on a rooftop terrace rail after sunset", "city night calm", "safe"],
  ["work-desk", "Work Desk Setup", "work", "working at a sleek desk with laptop and coffee", "productive but relaxed", "safe"],
  ["casual-dinner", "Casual Dinner Outing", "city", "arriving at a softly lit dinner spot in the evening", "effortless evening", "safe"],
].map(([id, title, category, promptTemplate, captionHint, riskLevel]) => ({
  id,
  title,
  category,
  promptTemplate,
  captionHint,
  riskLevel: riskLevel as SceneTemplate["riskLevel"],
  createdAt: now,
}));

export function getSceneTemplateById(id: string) {
  return sceneLibrary.find((scene) => scene.id === id);
}
