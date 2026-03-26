import { SceneTemplate } from "@/lib/types";

const now = new Date().toISOString();

type SceneVariantConfig = {
  anchors: string[];
  lighting: string[];
  props: string[];
  framing: string[];
  atmosphere: string[];
};

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

const sceneVariants: Record<string, SceneVariantConfig> = {
  "morning-coffee": {
    anchors: [
      "near a bright apartment kitchen window",
      "at a marble breakfast counter in a quiet modern kitchen",
      "by a sunlit dining nook with soft curtains",
      "beside an open balcony door in a small city apartment",
    ],
    lighting: [
      "soft early-morning daylight",
      "gentle warm sunlight with long shadows",
      "clean white daylight with subtle highlights",
      "quiet golden morning light",
    ],
    props: [
      "ceramic mug and a small plate of toast",
      "coffee mug and an open notebook",
      "latte, fruit bowl, and folded newspaper",
      "tea cup and a phone resting on the counter",
    ],
    framing: [
      "candid domestic half-body framing",
      "slightly off-center kitchen snapshot",
      "clean morning lifestyle composition",
      "casual home lookbook angle",
    ],
    atmosphere: [
      "slow start mood",
      "quiet everyday softness",
      "clean home realism",
      "peaceful weekday morning",
    ],
  },
  "kitchen-cooking": {
    anchors: [
      "in a modern home kitchen with matte cabinets",
      "at a bright kitchen island with natural stone surfaces",
      "in a compact apartment kitchen with open shelving",
      "near a stovetop and prep counter in clean daylight",
    ],
    lighting: [
      "soft noon daylight",
      "bright clean kitchen daylight",
      "warm natural light from a side window",
      "subtle daylight with realistic shadow falloff",
    ],
    props: [
      "cutting board, vegetables, and olive oil",
      "mixing bowl, eggs, and a kitchen towel",
      "coffee, fruit, and cooking ingredients",
      "plate, herbs, and a half-prepared breakfast",
    ],
    framing: [
      "candid cooking snapshot",
      "natural movement near the prep counter",
      "editorial domestic half-body frame",
      "slightly imperfect home photo angle",
    ],
    atmosphere: [
      "small domestic ritual",
      "clean home routine energy",
      "easy weekend cooking mood",
      "quiet lifestyle realism",
    ],
  },
  "cafe-window": {
    anchors: [
      "inside a minimalist cafe with a large street-facing window",
      "at a quiet corner table in a boutique coffee shop",
      "by a cafe window with soft city blur outside",
      "in a modern coffee bar with warm wood textures",
    ],
    lighting: [
      "soft afternoon daylight through glass",
      "muted city daylight with gentle highlights",
      "clean overcast daylight for soft shadows",
      "bright window light with realistic falloff",
    ],
    props: [
      "coffee cup and pastry plate",
      "iced drink, handbag, and a phone on the table",
      "open menu, coffee, and sunglasses",
      "latte, small dessert, and a city tote bag",
    ],
    framing: [
      "candid seated cafe frame",
      "slightly off-center lifestyle crop",
      "window-side social snapshot",
      "clean cafe lookbook angle",
    ],
    atmosphere: [
      "city pause mood",
      "soft social calm",
      "quiet solo coffee break",
      "slow afternoon rhythm",
    ],
  },
  bookstore: {
    anchors: [
      "inside a boutique bookstore with art books and tall shelves",
      "between design and photography shelves in a sunlit bookshop",
      "near a bookstore display table with stacked magazines",
      "in a quiet independent bookstore with wooden shelving",
    ],
    lighting: [
      "clean daylight from the storefront windows",
      "soft bookstore ambient light with natural falloff",
      "bright afternoon light filtering into the store",
      "muted daylight with soft contrast",
    ],
    props: [
      "open art book and tote bag",
      "stack of magazines and a shoulder bag",
      "hardcover book and sunglasses in hand",
      "paper shopping bag and design journal",
    ],
    framing: [
      "candid browsing frame",
      "mid-step bookstore snapshot",
      "editorial half-body shelf-side composition",
      "clean street-style indoor crop",
    ],
    atmosphere: [
      "quiet discovery mood",
      "thoughtful city afternoon",
      "soft intellectual lifestyle feel",
      "calm boutique browsing energy",
    ],
  },
  "beach-walk": {
    anchors: [
      "along a quiet shoreline with gentle waves",
      "on a sandy beach near the waterline",
      "beside a rocky coast path at the beach",
      "walking past empty beach chairs and soft surf",
    ],
    lighting: [
      "golden hour sunlight",
      "late afternoon coastal light",
      "soft warm sunset glow",
      "clean sunlit beach light with natural highlights",
    ],
    props: [
      "sandals in hand",
      "straw tote and sunglasses",
      "light beach layer draped over one arm",
      "small woven bag and loose hair ribbon",
    ],
    framing: [
      "walking lifestyle frame",
      "candid vacation photo angle",
      "slightly imperfect coastal snapshot",
      "soft travel lookbook crop",
    ],
    atmosphere: [
      "coastal ease",
      "vacation calm",
      "warm relaxed summer mood",
      "quiet golden-hour freedom",
    ],
  },
  poolside: {
    anchors: [
      "at a minimalist white-stone hotel pool",
      "beside a private villa pool with clean architecture",
      "near a rooftop pool with city skyline in the distance",
      "at a tropical resort pool with cabana seating",
      "near an indoor luxury pool with reflective water",
      "by a sunlit courtyard pool with pale neutral walls",
    ],
    lighting: [
      "bright clear afternoon sunlight",
      "soft luxury resort daylight",
      "golden-hour pool light",
      "clean noon light with crisp shadows",
      "soft overcast resort light",
    ],
    props: [
      "sunglasses and a folded towel",
      "lounge chair and a cold drink",
      "woven bag and a paperback book",
      "poolside stool with fruit and sparkling water",
      "cabana curtain and sunhat nearby",
    ],
    framing: [
      "candid resort snapshot",
      "poolside lookbook composition",
      "slightly off-center vacation frame",
      "clean editorial leisure crop",
      "relaxed pool-edge lifestyle angle",
    ],
    atmosphere: [
      "quiet luxury vacation mood",
      "sunny calm",
      "refined resort ease",
      "soft summer confidence",
      "private escape feeling",
    ],
  },
  "city-shopping": {
    anchors: [
      "on a clean downtown shopping street",
      "near a modern department store facade",
      "along a city sidewalk with boutique storefronts",
      "beside a stone building and passing traffic",
    ],
    lighting: [
      "soft afternoon daylight",
      "clean city daylight",
      "slightly overcast urban light",
      "bright sun with realistic street shadows",
    ],
    props: [
      "shopping bags and shoulder bag",
      "coffee cup and tote bag",
      "phone in hand and small paper bag",
      "sunglasses and a handbag",
    ],
    framing: [
      "street-style lookbook frame",
      "candid walking snapshot",
      "clean editorial city crop",
      "slightly imperfect handheld street photo",
    ],
    atmosphere: [
      "weekend city energy",
      "urban daytime calm",
      "clean downtown mood",
      "fashion errand moment",
    ],
  },
  "mirror-selfie": {
    anchors: [
      "in a clean apartment bedroom with a tall mirror",
      "near a full-length mirror in a minimalist dressing area",
      "inside a softly lit apartment hallway mirror setup",
      "in a bright bedroom mirror corner with neutral decor",
    ],
    lighting: [
      "soft natural room light",
      "clean window light with subtle shadows",
      "bright apartment daylight",
      "muted indoor daylight with realistic falloff",
    ],
    props: [
      "phone visible in hand",
      "bed edge and side table in background",
      "chair, mirror, and a small handbag nearby",
      "dresser top with beauty items softly out of focus",
    ],
    framing: [
      "personal-post selfie framing",
      "slightly imperfect mirror snapshot",
      "casual bedroom social photo",
      "clean indoor selfie crop",
    ],
    atmosphere: [
      "personal diary feel",
      "quiet self-check moment",
      "casual home confidence",
      "soft private-post energy",
    ],
  },
  "sunset-balcony": {
    anchors: [
      "on a high-rise balcony with soft skyline blur",
      "at an apartment balcony with city buildings beyond",
      "on a quiet terrace with railing and evening sky",
      "on a sunset balcony with plants and skyline layers",
    ],
    lighting: [
      "golden sunset light",
      "soft evening glow",
      "blue-hour city light with warm skin tones",
      "fading sunlight with gentle contrast",
    ],
    props: [
      "drink glass on a side table",
      "light cardigan and phone nearby",
      "small outdoor chair and city cup",
      "balcony plant pots and a casual tote bag",
    ],
    framing: [
      "candid evening balcony frame",
      "three-quarter skyline composition",
      "soft after-hours lookbook crop",
      "slightly off-center sunset snapshot",
    ],
    atmosphere: [
      "after-hours mood",
      "quiet city unwind",
      "soft romantic evening calm",
      "golden hour reflection",
    ],
  },
  "casual-gym": {
    anchors: [
      "inside a boutique gym with mirrors and clean equipment",
      "in a bright studio gym with natural light",
      "near a stretching area with minimal gym gear",
      "walking through a modern wellness club interior",
    ],
    lighting: [
      "clean daylight mixed with soft interior light",
      "bright studio wellness light",
      "neutral fitness-club daylight",
      "soft realistic gym lighting",
    ],
    props: [
      "water bottle and gym tote",
      "towel and headphones",
      "phone and training mat",
      "light hand weights nearby",
    ],
    framing: [
      "casual wellness snapshot",
      "active lifestyle half-body crop",
      "slightly imperfect fitness-club framing",
      "clean athleisure lookbook angle",
    ],
    atmosphere: [
      "light fitness vibe",
      "healthy routine energy",
      "active but polished mood",
      "easy wellness moment",
    ],
  },
  "weekend-brunch": {
    anchors: [
      "at an airy brunch cafe with white tableware",
      "outside at a weekend brunch terrace table",
      "in a modern brunch spot with soft natural light",
      "at a cozy cafe table with bright weekend daylight",
    ],
    lighting: [
      "soft weekend daylight",
      "clean terrace morning light",
      "bright brunch-hour sunlight",
      "muted daylight with warm table highlights",
    ],
    props: [
      "coffee, cutlery, and brunch plates",
      "juice glass, pastries, and phone",
      "menu card and iced coffee",
      "floral table setting and brunch spread",
    ],
    framing: [
      "social brunch snapshot",
      "table-side lifestyle crop",
      "clean weekend cafe composition",
      "candid seated brunch frame",
    ],
    atmosphere: [
      "slow weekend",
      "light social ease",
      "easy brunch happiness",
      "soft city leisure",
    ],
  },
  "reading-sofa": {
    anchors: [
      "on a textured sofa beside a large window",
      "in a bright living room with layered cushions",
      "on a cream sofa with a knit throw blanket",
      "near a lounge chair and bookshelf in a calm apartment",
    ],
    lighting: [
      "soft home daylight",
      "warm window light with gentle falloff",
      "muted indoor daylight",
      "late afternoon room light",
    ],
    props: [
      "open book and tea mug",
      "hardcover novel and blanket",
      "magazine stack and coffee cup",
      "reading glasses and a pillow",
    ],
    framing: [
      "quiet indoor candid angle",
      "soft home lookbook crop",
      "slightly imperfect living-room snapshot",
      "clean reading moment framing",
    ],
    atmosphere: [
      "calm indoor moment",
      "slow private afternoon",
      "quiet comfort mood",
      "soft domestic ease",
    ],
  },
  "airport-waiting": {
    anchors: [
      "near a wide airport window with runway light",
      "in a modern airport waiting lounge",
      "by boarding gates with clean travel architecture",
      "seated near an airport window and charging area",
    ],
    lighting: [
      "bright travel daylight",
      "soft window light in the terminal",
      "clean airport ambient light",
      "muted daylight through large terminal glass",
    ],
    props: [
      "carry-on suitcase and phone",
      "passport wallet and coffee cup",
      "handbag and travel headphones",
      "luggage, tote bag, and boarding pass",
    ],
    framing: [
      "travel waiting snapshot",
      "candid airport lifestyle crop",
      "slightly off-center terminal frame",
      "clean between-cities composition",
    ],
    atmosphere: [
      "between cities",
      "quiet departure mood",
      "soft travel anticipation",
      "calm transit moment",
    ],
  },
  "hotel-morning": {
    anchors: [
      "inside a boutique hotel room with soft bedding",
      "near hotel curtains and a morning-lit window",
      "in a clean luxury suite with pale neutral decor",
      "by a hotel lounge chair and bedside table",
    ],
    lighting: [
      "soft morning hotel light",
      "warm early daylight through curtains",
      "clean window light with subtle highlights",
      "quiet luxury daylight falloff",
    ],
    props: [
      "coffee tray and robe belt",
      "bed linens and room-service tray",
      "side table, magazine, and slippers",
      "curtain edge and a travel bag nearby",
    ],
    framing: [
      "calm hotel candid frame",
      "soft room lifestyle composition",
      "clean morning suite crop",
      "slightly imperfect luxury-stay snapshot",
    ],
    atmosphere: [
      "quiet luxury",
      "slow hotel morning",
      "private soft reset",
      "calm travel indulgence",
    ],
  },
  "car-selfie": {
    anchors: [
      "from the passenger seat of a modern car interior",
      "inside a parked car with city light outside",
      "in a moving car with soft road blur beyond the windows",
      "from a bright passenger-side angle with dashboard detail",
    ],
    lighting: [
      "clean daylight through car windows",
      "soft moving daylight with natural shadows",
      "golden-hour drive light",
      "muted road light with realistic highlights",
    ],
    props: [
      "seatbelt, phone, and tote bag",
      "coffee cup in center console",
      "sunglasses and handbag nearby",
      "dashboard detail and a casual hand pose",
    ],
    framing: [
      "personal travel selfie framing",
      "slightly imperfect handheld car photo",
      "casual passenger-seat snapshot",
      "soft social-media phone crop",
    ],
    atmosphere: [
      "on the move",
      "easy travel moment",
      "city drive calm",
      "casual transit mood",
    ],
  },
  "rainy-window": {
    anchors: [
      "beside a rain-covered apartment window",
      "near a fogged window in a quiet room",
      "by a large rain-streaked pane with muted outside blur",
      "at a moody window corner with soft indoor shadows",
    ],
    lighting: [
      "cool rainy daylight",
      "soft moody window light",
      "muted overcast indoor light",
      "gray daylight with gentle contrast",
    ],
    props: [
      "tea cup on the sill",
      "light cardigan and a closed book",
      "blanket, window frame, and a chair nearby",
      "phone on the sill and soft curtain edge",
    ],
    framing: [
      "cinematic indoor portrait angle",
      "moody candid window crop",
      "soft contemplative composition",
      "slightly imperfect rainy-day snapshot",
    ],
    atmosphere: [
      "cinematic weather",
      "quiet reflective mood",
      "soft rainy stillness",
      "indoor introspective calm",
    ],
  },
  "garden-afternoon": {
    anchors: [
      "walking through a private garden path",
      "near flowering shrubs and trimmed greenery",
      "in a sunlit courtyard garden with stone steps",
      "along a soft garden walkway with trees overhead",
    ],
    lighting: [
      "bright afternoon sun",
      "soft garden daylight",
      "golden late-afternoon park light",
      "gentle sun filtered through leaves",
    ],
    props: [
      "small straw bag",
      "flowers in hand",
      "light cardigan and sunglasses",
      "garden bench and a book nearby",
    ],
    framing: [
      "outdoor candid lifestyle frame",
      "walking garden snapshot",
      "soft editorial nature crop",
      "clean weekend daylight composition",
    ],
    atmosphere: [
      "weekend softness",
      "quiet outdoor ease",
      "light garden calm",
      "peaceful afternoon freshness",
    ],
  },
  "rooftop-evening": {
    anchors: [
      "on a rooftop terrace with city lights behind",
      "near a rooftop rail overlooking downtown buildings",
      "on a high city rooftop with blurred evening traffic below",
      "beside a terrace edge with neon and skyline glow",
    ],
    lighting: [
      "soft blue-hour city light",
      "clean evening glow with urban bokeh",
      "subtle night-city contrast",
      "warm skin tones against cooler city lights",
    ],
    props: [
      "light jacket and a phone",
      "drink glass near the rail",
      "small handbag and rooftop chair",
      "city railing and evening table detail",
    ],
    framing: [
      "night-city lookbook frame",
      "clean rooftop editorial snapshot",
      "slightly imperfect evening lifestyle crop",
      "candid terrace composition",
    ],
    atmosphere: [
      "city night calm",
      "urban after-dark mood",
      "soft rooftop confidence",
      "quiet skyline energy",
    ],
  },
  "work-desk": {
    anchors: [
      "at a sleek desk with laptop and coffee",
      "in a bright work corner with monitor and notebook",
      "at a minimalist home office setup by a window",
      "in a clean desk space with daylight and stationery",
    ],
    lighting: [
      "clean daylight workspace lighting",
      "soft office window light",
      "bright neutral desk daylight",
      "subtle morning work light",
    ],
    props: [
      "laptop, coffee, and notebook",
      "planner, phone, and keyboard",
      "tablet, water glass, and headphones",
      "pen, coffee cup, and tidy stationery",
    ],
    framing: [
      "productive lifestyle snapshot",
      "desk-side candid half-body frame",
      "clean workday composition",
      "slightly imperfect workspace photo",
    ],
    atmosphere: [
      "productive but relaxed",
      "clean focused mood",
      "calm work routine",
      "soft weekday momentum",
    ],
  },
  "casual-dinner": {
    anchors: [
      "outside a softly lit dinner restaurant",
      "at a cozy evening table with warm lighting",
      "inside a polished city bistro with gentle ambient glow",
      "near a restaurant entry with blurred evening lights",
    ],
    lighting: [
      "soft evening ambient light",
      "warm restaurant glow",
      "clean city-night warmth",
      "subtle dusk light with realistic contrast",
    ],
    props: [
      "menu and a drink glass",
      "handbag on the chair and cutlery nearby",
      "table candle and small plate setting",
      "phone and a dinner reservation card",
    ],
    framing: [
      "evening lifestyle snapshot",
      "understated city-dinner crop",
      "soft after-dark editorial frame",
      "slightly imperfect restaurant photo",
    ],
    atmosphere: [
      "effortless evening",
      "soft dinner polish",
      "easy city-night mood",
      "warm social calm",
    ],
  },
};

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

export function getSceneVariantBlock(scene: SceneTemplate, seed: string) {
  const config = sceneVariants[scene.id];

  if (!config) {
    return scene.promptTemplate;
  }

  return [
    scene.promptTemplate,
    pickVariant(`${seed}:anchor`, config.anchors),
    pickVariant(`${seed}:lighting`, config.lighting),
    pickVariant(`${seed}:props`, config.props),
    pickVariant(`${seed}:framing`, config.framing),
    pickVariant(`${seed}:atmosphere`, config.atmosphere),
  ]
    .filter(Boolean)
    .join(", ");
}

export function getSceneTemplateById(id: string) {
  return sceneLibrary.find((scene) => scene.id === id);
}
