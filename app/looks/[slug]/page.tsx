import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResponsiveImage } from "@/src/components/media/ResponsiveImage";
import { LookInformation } from "@/src/components/look/LookInformation";
import { Container } from "@/src/components/ui/Container";
import { getLookBySlug, getLooks } from "@/src/lib/repositories/look-repository";
import { getCollections } from "@/src/lib/repositories/collection-repository";
export async function generateStaticParams(){ return (await getLooks()).map(({slug})=>({slug})); }
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const look=await getLookBySlug((await params).slug); return look?{title:look.seo.title,description:look.seo.description}:{};}
export default async function LookPage({params}:{params:Promise<{slug:string}>}){const look=await getLookBySlug((await params).slug);if(!look)notFound();const collection=(await getCollections()).find((x)=>x.id===look.collectionId);return <section className="bg-ivory pb-28 pt-28 text-black"><Container><div className="grid gap-12 lg:grid-cols-[1.3fr_.7fr] lg:items-start"><div className="space-y-5">{look.images.map((image,i)=><ResponsiveImage key={`${image.src}-${i}`} asset={image} className={i===1?"aspect-[4/3]":"aspect-[3/4]"} priority={i===0} sizes="(max-width:1024px) 100vw, 64vw"/>)}</div><LookInformation look={look} collection={collection?.title??"Batik NXT"}/></div></Container></section>}
