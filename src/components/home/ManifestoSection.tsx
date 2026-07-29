"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { content } from "@/src/content/en";
import { Container } from "@/src/components/ui/Container";
import { SectionLabel } from "@/src/components/ui/SectionLabel";
export function ManifestoSection() { const root = useRef<HTMLElement>(null); useEffect(() => { if (matchMedia("(prefers-reduced-motion: reduce)").matches) return; gsap.registerPlugin(ScrollTrigger); const ctx = gsap.context(() => { gsap.fromTo(".manifesto-line", { color: "rgba(9,9,9,.18)" }, { color: "#090909", stagger: .15, scrollTrigger: { trigger: root.current, start: "top 72%", end: "bottom 62%", scrub: true } }); }, root); return () => ctx.revert(); }, []); return <section ref={root} className="bg-ivory py-24 text-black sm:py-36"><Container><div className="grid gap-14 lg:grid-cols-[14rem_1fr]"><div><SectionLabel number="01">Manifesto</SectionLabel><p className="mt-6 max-w-[12rem] text-xs leading-5 text-black/55">Contemporary Malaysian luxury, built between cultural memory and future form.</p></div><h2 className="font-display text-[clamp(2.7rem,6vw,7rem)] leading-[.92] tracking-[-.045em]">{content.manifesto.map((line, i) => <span key={line} className={`manifesto-line block ${i === 1 ? "!text-deep-red" : ""}`}>{line}</span>)}</h2></div></Container></section>; }
