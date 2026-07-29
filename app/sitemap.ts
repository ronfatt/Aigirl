import type { MetadataRoute } from "next";
import { settings } from "@/src/data/settings";
import { getCollections } from "@/src/lib/repositories/collection-repository";
import { getLooks } from "@/src/lib/repositories/look-repository";
import { getJournalArticles } from "@/src/lib/repositories/journal-repository";
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const base=settings.siteUrl;const staticRoutes=["","/collections","/looks","/journal","/about","/craftsmanship","/contact","/privacy","/terms"];const[c,l,j]=await Promise.all([getCollections(),getLooks(),getJournalArticles()]);return [...staticRoutes.map(url=>({url:`${base}${url}`,lastModified:new Date(),changeFrequency:"monthly" as const,priority:url===""?1:.7})),...c.map(x=>({url:`${base}/collections/${x.slug}`,lastModified:new Date(),changeFrequency:"monthly" as const,priority:.8})),...l.map(x=>({url:`${base}/looks/${x.slug}`,lastModified:new Date(),changeFrequency:"monthly" as const,priority:.7})),...j.map(x=>({url:`${base}/journal/${x.slug}`,lastModified:new Date(x.publishedAt),changeFrequency:"yearly" as const,priority:.6}))]}
