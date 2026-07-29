import { journalArticles } from "@/src/data/journal";
export async function getJournalArticles() { return journalArticles; }
export async function getArticleBySlug(slug: string) { return journalArticles.find((article) => article.slug === slug); }
export async function getRelatedArticles(ids: string[]) { return journalArticles.filter((article) => ids.includes(article.id)); }
