import { SceneTemplate } from "@/lib/types";

const now = new Date().toISOString();

export const sceneLibrary: SceneTemplate[] = [
  ["morning-coffee", "Morning Coffee at Home", "home", "holding a ceramic mug near a bright kitchen window with candid daylight realism", "slow start, warm light", "safe"],
  ["kitchen-cooking", "Kitchen Cooking", "home", "preparing a casual breakfast in a modern kitchen with understated editorial realism", "small domestic rituals", "safe"],
  ["cafe-window", "Cafe Window Seat", "cafe", "sitting by a cafe window with natural daylight and a candid city pause feel", "city pause, soft mood", "safe"],
  ["bookstore", "Bookstore Browsing", "city", "looking through art and design books in a boutique bookstore with clean daylight street energy", "quiet discovery", "safe"],
  ["beach-walk", "Beach Walk", "travel", "walking barefoot near the shoreline at golden hour with natural movement and film softness", "coastal ease", "suggestive"],
  ["poolside", "Poolside Relaxing", "travel", "lounging near a minimalist pool with refined resort styling and candid lookbook framing", "sunny calm", "suggestive"],
  ["city-shopping", "City Shopping", "city", "carrying shopping bags along a stylish downtown street with soft daylight and passing urban blur", "weekend city energy", "safe"],
  ["mirror-selfie", "Mirror Selfie at Home", "home", "taking a mirror selfie in a clean apartment interior with understated personal-post realism", "personal diary feel", "suggestive"],
  ["sunset-balcony", "Sunset Balcony", "home", "standing on a balcony during sunset with skyline behind and softer candid evening light", "after-hours mood", "safe"],
  ["casual-gym", "Casual Gym Visit", "wellness", "walking through a boutique gym in stylish athleisure", "light fitness vibe", "safe"],
  ["weekend-brunch", "Weekend Brunch", "cafe", "sharing a relaxed brunch table with soft daylight and candid social framing", "slow weekend", "safe"],
  ["reading-sofa", "Reading on Sofa", "home", "reading on a textured sofa with layered blankets and soft home film realism", "calm indoor moment", "safe"],
  ["airport-waiting", "Airport Waiting Area", "travel", "sitting near an airport window with luggage in a quiet candid travel frame", "between cities", "safe"],
  ["hotel-morning", "Hotel Room Morning Light", "travel", "soft morning light in a boutique hotel room with understated lifestyle realism", "quiet luxury", "suggestive"],
  ["car-selfie", "Car Passenger Seat Selfie", "travel", "capturing a natural selfie from the passenger seat with casual phone-photo framing", "on the move", "safe"],
  ["rainy-window", "Rainy Day Window Portrait", "home", "standing by a rain-covered window in moody light with muted film tones", "cinematic weather", "safe"],
  ["garden-afternoon", "Garden Afternoon", "outdoor", "walking through a private garden in afternoon sun with soft natural movement", "weekend softness", "safe"],
  ["rooftop-evening", "Rooftop Evening", "city", "leaning on a rooftop terrace rail after sunset with clean city-night bokeh", "city night calm", "safe"],
  ["work-desk", "Work Desk Setup", "work", "working at a sleek desk with laptop and coffee in candid daylight realism", "productive but relaxed", "safe"],
  ["casual-dinner", "Casual Dinner Outing", "city", "arriving at a softly lit dinner spot in the evening with understated city polish", "effortless evening", "safe"],
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
