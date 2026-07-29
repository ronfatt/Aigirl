import { HeroSection } from "@/src/components/home/HeroSection";
import { ManifestoSection } from "@/src/components/home/ManifestoSection";
import { FeaturedCollection } from "@/src/components/home/FeaturedCollection";
import { HorizontalLookbook } from "@/src/components/home/HorizontalLookbook";
import { CraftsmanshipPreview } from "@/src/components/home/CraftsmanshipPreview";
import { CollectionsGrid } from "@/src/components/home/CollectionsGrid";
import { SignatureLook } from "@/src/components/home/SignatureLook";
import { JournalPreview } from "@/src/components/home/JournalPreview";
import { NewsletterSection } from "@/src/components/home/NewsletterSection";
import { getFeaturedCollections } from "@/src/lib/repositories/collection-repository";
import { getFeaturedLooks } from "@/src/lib/repositories/look-repository";
import { getJournalArticles } from "@/src/lib/repositories/journal-repository";
export default async function HomePage() { const [collections, looks, articles] = await Promise.all([getFeaturedCollections(), getFeaturedLooks(), getJournalArticles()]); return <><HeroSection/><ManifestoSection/><FeaturedCollection collection={collections[0]}/><HorizontalLookbook looks={looks}/><CraftsmanshipPreview/><CollectionsGrid collections={collections}/><SignatureLook/><JournalPreview articles={articles}/><NewsletterSection/></>; }
