"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ResponsiveImage } from "@/src/components/media/ResponsiveImage";
import { formatDate } from "@/src/lib/utils";
import type { JournalArticle } from "@/src/types";
const filters=["all","studio","craft","collection","culture"];
export function JournalGrid({articles}:{articles:JournalArticle[]}){const[active,setActive]=useState("all");const shown=active==="all"?articles:articles.filter(x=>x.category===active);return <><div className="mb-12 flex flex-wrap gap-6 border-y border-black/15 py-5">{filters.map(x=><button key={x} onClick={()=>setActive(x)} className={`text-[10px] uppercase tracking-[.18em] ${active===x?"text-deep-red":"text-black/45"}`}>{x}</button>)}</div><motion.div layout className="grid gap-12 md:grid-cols-2">{shown.map((a,i)=><motion.article layout key={a.id} className={i%3===1?"md:mt-24":""}><Link href={`/journal/${a.slug}`} className="group"><ResponsiveImage asset={a.coverImage} className="aspect-[4/3]" imageClassName="transition duration-700 group-hover:scale-[1.025]"/><p className="mt-5 text-[9px] uppercase tracking-[.17em] text-black/45">{a.category} · {formatDate(a.publishedAt)} · {a.readingTime} min</p><h2 className="mt-3 font-display text-4xl">{a.title}</h2><p className="mt-3 max-w-lg text-sm leading-6 text-black/55">{a.excerpt}</p></Link></motion.article>)}</motion.div></>}
