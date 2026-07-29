"use client";
import { useState } from "react";
import { ResponsiveImage } from "@/src/components/media/ResponsiveImage";
import { Button } from "@/src/components/ui/Button";
import { Container } from "@/src/components/ui/Container";
import { Modal } from "@/src/components/ui/Modal";
import type { MediaAsset } from "@/src/types";
const studies: { image: MediaAsset; title: string; text: string }[] = [
  { image: { src: "/images/details/crimson-detail.svg", alt: "Crimson hand-drawn motif detail", width: 1200, height: 1600, aspectRatio: "portrait" }, title: "Motif / Scale", text: "Botanical lines are enlarged beyond recognition and redrawn for the body." },
  { image: { src: "/images/journal/fabric.svg", alt: "Fabric and lace layering study", width: 1600, height: 1100, aspectRatio: "landscape" }, title: "Surface / Layer", text: "Hand-drawn batik is held beneath architectural lace." },
  { image: { src: "/images/details/noir-detail.svg", alt: "Black tailored construction detail", width: 1200, height: 1600, aspectRatio: "portrait" }, title: "Cut / Structure", text: "Tailored planes turn motif into seam, edge and volume." },
];
export function CraftsmanshipPreview() { const [active, setActive] = useState<number | null>(null); return <section className="bg-charcoal py-24 text-ivory sm:py-36"><Container><div className="grid gap-14 lg:grid-cols-[.65fr_1.35fr]"><div className="lg:sticky lg:top-32 lg:self-start"><p className="text-[10px] uppercase tracking-[.22em]">04 · Detail Study</p><h2 className="mt-6 font-display text-[clamp(3.2rem,6vw,6.5rem)] uppercase leading-[.82]">Where pattern<br/>meets structure.</h2><Button href="/craftsmanship" className="mt-10">Explore the Process</Button></div><div className="space-y-20">{studies.map((study, i) => <article key={study.title} className={i === 1 ? "lg:ml-28" : ""}><button onClick={() => setActive(i)} className="block w-full text-left"><ResponsiveImage asset={study.image} className={i === 1 ? "aspect-[4/3]" : "aspect-[4/5] lg:aspect-[3/4]"}/></button><div className="mt-4 grid gap-2 border-t border-white/15 pt-4 sm:grid-cols-2"><h3 className="font-display text-2xl">{study.title}</h3><p className="text-sm leading-6 text-white/55">{study.text}</p></div></article>)}</div></div></Container><Modal open={active !== null} onClose={() => setActive(null)} title="Detail Study">{active !== null && <ResponsiveImage asset={studies[active].image} className="aspect-[4/5]"/>}</Modal></section>; }
