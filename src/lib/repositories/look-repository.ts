import { looks } from "@/src/data/looks";
export async function getLooks() { return looks; }
export async function getFeaturedLooks() { return looks.filter((look) => look.featured); }
export async function getLooksByCollection(collectionId: string) { return looks.filter((look) => look.collectionId === collectionId); }
export async function getLookBySlug(slug: string) { return looks.find((look) => look.slug === slug); }
