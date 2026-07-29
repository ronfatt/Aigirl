import type { Metadata } from "next";
import { EditorialHero } from "@/src/components/layout/EditorialHero";
import { JournalGrid } from "@/src/components/journal/JournalGrid";
import { Container } from "@/src/components/ui/Container";
import { getJournalArticles } from "@/src/lib/repositories/journal-repository";
export const metadata:Metadata={title:"Journal",description:"Studio notes on culture, craft, collections and contemporary Malaysian fashion."};
export default async function JournalPage(){return <><EditorialHero title="Journal" intro="Notes from the studio on form, material, culture and the making of a new fashion language."/><section className="bg-ivory pb-28 text-black"><Container><JournalGrid articles={await getJournalArticles()}/></Container></section></>}
