import type { Look, MediaAsset } from "@/src/types";

const palettes = {
  crimson: ["#6E1118", "#9B2028"], noir: ["#090909", "#8C6947"], ivory: ["#F1EDE5", "#8C6947"],
};
const asset = (src: string, alt: string): MediaAsset => ({ src, alt, width: 1200, height: 1600, aspectRatio: "portrait", focalPoint: { x: 50, y: 34 } });
const specs = [
  ["01", "Crimson Veil", "collection-001", "crimson", "Night hibiscus", "Sculpted shoulder, fitted waist, asymmetrical floor-length drape."],
  ["02", "Vermilion Arc", "collection-001", "crimson", "Botanical vine", "Curved corsetry beneath a weightless organza column."],
  ["03", "Petal Armour", "collection-001", "crimson", "Night hibiscus", "Architectural peplum with a narrow tailored line."],
  ["04", "Red Interval", "collection-001", "crimson", "Botanical vine", "Layered sheer panels suspended from a precise shoulder."],
  ["05", "Shadow Bloom", "collection-002", "noir", "Shadow fern", "Long black column interrupted by an enlarged botanical plane."],
  ["06", "Nocturne Fold", "collection-002", "noir", "Moon orchid", "Folded tailoring with a controlled asymmetric train."],
  ["07", "Black Canopy", "collection-002", "noir", "Shadow fern", "Cocoon volume refined by a sharply defined waist."],
  ["08", "Orchid Static", "collection-002", "noir", "Moon orchid", "Sheer torso construction with graphic tailored panels."],
  ["09", "Quiet Ceremony", "collection-003", "ivory", "River current", "Ivory drape wrapping the body in an unbroken spiral."],
  ["10", "Pale Geometry", "collection-003", "ivory", "Seed geometry", "Structured cape line over a narrow silk base."],
  ["11", "Light Archive", "collection-003", "ivory", "River current", "Layered lace volumes held by tonal internal corsetry."],
  ["12", "Ritual Form", "collection-003", "ivory", "Seed geometry", "A sculpted ceremonial silhouette with floating side panels."],
] as const;

export const looks: Look[] = specs.map(([number, title, collectionId, tone, motif, silhouette], index) => {
  const slug = title.toLowerCase().replaceAll(" ", "-");
  const colour = palettes[tone];
  const src = `/images/looks/${tone}-${(index % 4) + 1}.svg`;
  const detail = `/images/details/${tone}-detail.svg`;
  return {
    id: `look-${number}`, slug: number === "01" ? "crimson-look-01" : slug, collectionId, number, title, year: 2026, category: tone === "crimson" ? "Couture" : tone === "noir" ? "Editorial" : "Concept", colour: [...colour],
    materials: tone === "crimson" ? ["Silk organza", "Embroidered lace", "Hand-finished batik textile"] : tone === "noir" ? ["Wool crepe", "Silk tulle", "Wax-resist cotton"] : ["Silk faille", "Cotton lace", "Tonal batik voile"],
    motif, silhouette, construction: "Hand-drawn motif, engineered placement and internal couture finishing shape the garment as a continuous structure.", availability: index % 3 === 0 ? "private-order" : "concept", designer: "Ronnie", description: `${title} translates ${motif.toLowerCase()} into a contemporary study of surface, proportion and movement.`,
    coverImage: asset(src, `${title}, Look ${number}`), images: [asset(src, `${title} front view`), asset(detail, `${title} textile detail`), asset(src, `${title} full silhouette`)], featured: index < 8,
    seo: { title: `${title} — Batik NXT`, description: `${title}, Look ${number} from Batik NXT.` },
  };
});
