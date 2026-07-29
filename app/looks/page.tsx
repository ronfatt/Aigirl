import type { Metadata } from "next";
import Link from "next/link";
import { EditorialHero } from "@/src/components/layout/EditorialHero";
import { ResponsiveImage } from "@/src/components/media/ResponsiveImage";
import { Container } from "@/src/components/ui/Container";
import { getLooks } from "@/src/lib/repositories/look-repository";
export const metadata: Metadata = { title:"Looks", description:"The Batik NXT look archive." };
export default async function LooksPage() { const looks = await getLooks(); return <><EditorialHero title="Looks" intro="Twelve studies in batik, transparency, structure and movement." dark/><section className="bg-black pb-28 text-ivory"><Container><div className="grid grid-cols-2 gap-x-3 gap-y-12 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">{looks.map((look,i) => <Link key={look.id} href={`/looks/${look.slug}`} className={`group ${i%4===1 ? "md:mt-20" : ""}`}><ResponsiveImage asset={look.coverImage} className="aspect-[3/4]" imageClassName="transition duration-700 group-hover:scale-[1.025]" sizes="(max-width:768px) 50vw, 25vw"/><p className="mt-3 text-[9px] uppercase tracking-[.16em] text-white/45">Look {look.number}</p><h2 className="font-display text-xl sm:text-2xl">{look.title}</h2></Link>)}</div></Container></section></>; }
