import type { Collection, MediaAsset } from "@/src/types";

const image = (src: string, alt: string): MediaAsset => ({ src, alt, width: 1200, height: 1600, aspectRatio: "portrait", focalPoint: { x: 50, y: 35 } });

export const collections: Collection[] = [
  {
    id: "collection-001", slug: "crimson-heritage", number: "001", title: "Crimson Heritage", subtitle: "Tradition, sharpened in red.", year: 2026, category: "couture",
    description: "A study of crimson batik, transparent lace and sculpted silhouettes, transforming botanical heritage into contemporary evening forms.",
    story: ["Crimson Heritage begins with the botanical line: enlarged until familiar petals become abstract architecture.", "Hand-drawn batik is layered beneath transparent lace, allowing motif and body to move at different rhythms.", "The silhouette is controlled, sculptural and ceremonial—never nostalgic."],
    coverImage: image("/images/collections/crimson.svg", "Sculptural crimson couture look with botanical batik"), heroMedia: { type: "image", src: "/images/collections/crimson.svg", alt: "Crimson Heritage campaign" },
    palette: ["#6E1118", "#9B2028", "#090909"], materials: ["Silk organza", "Embroidered lace", "Hand-finished batik"], motifs: ["Night hibiscus", "Botanical vine"], lookIds: ["look-01", "look-02", "look-03", "look-04"], featured: true, status: "published", seo: { title: "Crimson Heritage — Batik NXT", description: "Crimson batik, transparent lace and sculpted couture silhouettes." },
  },
  {
    id: "collection-002", slug: "noir-botanica", number: "002", title: "Noir Botanica", subtitle: "Nature drawn into shadow.", year: 2026, category: "editorial",
    description: "Deep black tailoring meets oversized botanical batik, sheer construction and controlled asymmetry.",
    story: ["Noir Botanica studies what happens when colour recedes and the motif becomes shadow.", "The collection cuts enlarged foliage across tailored planes, using transparency as negative space.", "Asymmetry is measured; every imbalance is anchored by a precise line."],
    coverImage: image("/images/collections/noir.svg", "Black tailored look with oversized botanical motif"), heroMedia: { type: "image", src: "/images/collections/noir.svg", alt: "Noir Botanica campaign" },
    palette: ["#090909", "#151515", "#8C6947"], materials: ["Wool crepe", "Silk tulle", "Wax-resist cotton"], motifs: ["Shadow fern", "Moon orchid"], lookIds: ["look-05", "look-06", "look-07", "look-08"], featured: true, status: "published", seo: { title: "Noir Botanica — Batik NXT", description: "Black tailoring, sheer construction and oversized botanical batik." },
  },
  {
    id: "collection-003", slug: "ivory-ritual", number: "003", title: "Ivory Ritual", subtitle: "Light, structure and quiet ceremony.", year: 2026, category: "concept",
    description: "An exploration of ivory textiles, tonal batik, layered lace and architectural draping.",
    story: ["Ivory Ritual removes contrast to reveal construction, surface and shadow.", "Tonal wax lines are redrawn across lace and silk as a quiet record of the hand.", "Draped structures create a new ceremony: intimate, modern and open-ended."],
    coverImage: image("/images/collections/ivory.svg", "Ivory draped concept look with tonal batik"), heroMedia: { type: "image", src: "/images/collections/ivory.svg", alt: "Ivory Ritual campaign" },
    palette: ["#F1EDE5", "#FAF8F3", "#8C6947"], materials: ["Silk faille", "Cotton lace", "Tonal batik voile"], motifs: ["River current", "Seed geometry"], lookIds: ["look-09", "look-10", "look-11", "look-12"], featured: true, status: "published", seo: { title: "Ivory Ritual — Batik NXT", description: "Tonal batik, layered lace and architectural ivory draping." },
  },
];
