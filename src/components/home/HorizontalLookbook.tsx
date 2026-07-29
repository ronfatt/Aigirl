"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ResponsiveImage } from "@/src/components/media/ResponsiveImage";
import type { Look } from "@/src/types";

export function HorizontalLookbook({ looks }: { looks: Look[] }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!root.current || !track.current || matchMedia("(max-width: 767px), (prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const distance = () => Math.max(0, track.current!.scrollWidth - innerWidth);
      gsap.to(track.current, { x: () => -distance(), ease: "none", scrollTrigger: { trigger: root.current, pin: true, scrub: 1, end: () => `+=${distance()}`, invalidateOnRefresh: true } });
    }, root);
    return () => ctx.revert();
  }, []);
  return <section ref={root} className="relative overflow-hidden bg-warm-white py-16 text-black md:h-[100svh] md:py-0"><div className="mb-10 flex items-end justify-between px-5 md:absolute md:left-10 md:right-10 md:top-24 md:z-10"><div><p className="text-[10px] uppercase tracking-[.22em]">03 · Lookbook</p><h2 className="mt-3 font-display text-5xl uppercase md:text-7xl">Forms in motion</h2></div><span className="text-[9px] uppercase tracking-[.2em] text-black/45 md:hidden">Swipe →</span></div><div ref={track} className="flex snap-x snap-mandatory items-end gap-5 overflow-x-auto px-5 pb-4 [scrollbar-width:none] md:h-full md:w-max md:gap-14 md:overflow-visible md:px-[35vw] md:pb-[8vh]">{looks.slice(0, 7).map((look, i) => <Link href={`/looks/${look.slug}`} key={look.id} className="group w-[75vw] shrink-0 snap-center md:w-[28vw]" style={{ marginBottom: `${(i % 3) * 3}vh` }} data-cursor="view"><ResponsiveImage asset={look.coverImage} className={i % 2 ? "aspect-[3/4]" : "aspect-[4/5]"} imageClassName="transition duration-700 group-hover:scale-[1.025]" sizes="(max-width:768px) 75vw, 28vw"/><div className="mt-4 flex justify-between border-t border-black/20 pt-3"><div><span className="text-[9px] uppercase tracking-[.18em]">Look {look.number}</span><h3 className="font-display text-2xl">{look.title}</h3></div><span className="text-[9px] uppercase tracking-[.15em] text-black/45">{look.materials[0]}</span></div></Link>)}</div></section>;
}
