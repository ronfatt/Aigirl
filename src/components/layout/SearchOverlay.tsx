"use client";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { collections } from "@/src/data/collections";
import { looks } from "@/src/data/looks";
import { journalArticles } from "@/src/data/journal";
import type { SearchResult } from "@/src/types";

const index: SearchResult[] = [
  ...collections.map((x) => ({ id: x.id, title: x.title, eyebrow: "Collection", href: `/collections/${x.slug}`, terms: [...x.materials, ...x.motifs, x.description] })),
  ...looks.map((x) => ({ id: x.id, title: `${x.number} — ${x.title}`, eyebrow: "Look", href: `/looks/${x.slug}`, terms: [...x.materials, x.motif, x.silhouette] })),
  ...journalArticles.map((x) => ({ id: x.id, title: x.title, eyebrow: "Journal", href: `/journal/${x.slug}`, terms: [x.excerpt, x.category] })),
];
export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState(""); const [active, setActive] = useState(0); const input = useRef<HTMLInputElement>(null);
  const results = useMemo(() => { const q = query.toLowerCase().trim(); return q ? index.filter((x) => [x.title, x.eyebrow, ...x.terms].join(" ").toLowerCase().includes(q)).slice(0, 10) : []; }, [query]);
  useEffect(() => { if (!open) return; document.body.style.overflow = "hidden"; setTimeout(() => input.current?.focus(), 100); const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)); } if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); } if (e.key === "Enter" && results[active]) window.location.href = results[active].href; }; document.addEventListener("keydown", key); return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", key); }; }, [open, onClose, results, active]);
  return <AnimatePresence>{open && <motion.div className="fixed inset-0 z-[100] bg-ivory text-black" initial={{ y: "-100%" }} animate={{ y: 0 }} exit={{ y: "-100%" }} transition={{ duration: .65, ease: [.76,0,.24,1] }} role="dialog" aria-modal="true" aria-label="Site search"><div className="flex h-20 items-center justify-between border-b border-black/15 px-5 sm:px-10"><span className="wordmark">BATIK NXT</span><button onClick={onClose} aria-label="Close search" className="p-2"><X /></button></div><div className="mx-auto max-w-5xl px-5 py-16 sm:px-10 sm:py-24"><label className="flex items-center gap-4 border-b border-black/30"><Search className="size-6"/><span className="sr-only">Search collections, looks and journal</span><input ref={input} value={query} onChange={(e) => { setQuery(e.target.value); setActive(0); }} placeholder="Search the archive" className="w-full bg-transparent py-5 font-display text-4xl outline-none placeholder:text-black/30 sm:text-6xl" /></label><p className="mt-4 text-[10px] uppercase tracking-[.22em] text-black/50">Collections · Looks · Materials · Motifs · Journal</p><div className="mt-12" aria-live="polite">{query && !results.length && <p className="font-display text-3xl">Nothing fixed. Try a colour, material or motif.</p>}{results.map((result, i) => <Link href={result.href} onClick={onClose} key={result.id} className={`flex items-center justify-between border-b border-black/15 py-5 transition ${i === active ? "pl-3 text-deep-red" : ""}`}><div><span className="text-[9px] uppercase tracking-[.2em] text-current/50">{result.eyebrow}</span><h3 className="font-display text-2xl sm:text-3xl">{result.title}</h3></div><ArrowRight /></Link>)}</div></div></motion.div>}</AnimatePresence>;
}
