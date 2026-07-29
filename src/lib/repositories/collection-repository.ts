import { collections } from "@/src/data/collections";
export async function getCollections() { return collections.filter((item) => item.status === "published"); }
export async function getFeaturedCollections() { return (await getCollections()).filter((item) => item.featured); }
export async function getCollectionBySlug(slug: string) { return (await getCollections()).find((item) => item.slug === slug); }
