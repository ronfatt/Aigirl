"use client";
import { useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { ActionButton } from "@/src/components/ui/Button";
import { InquiryForm } from "./InquiryForm";
import type { Look } from "@/src/types";

export function LookInformation({ look, collection }: { look: Look; collection: string }) {
  const [open,setOpen] = useState(false);
  const rows = [["Collection",collection],["Year",String(look.year)],["Category",look.category],["Colour",look.colour.join(", ")],["Materials",look.materials.join(", ")],["Batik motif",look.motif],["Silhouette",look.silhouette],["Construction",look.construction],["Availability",look.availability.replaceAll("-"," ")],["Designer",look.designer]];
  const share = async () => { if (navigator.share) await navigator.share({ title:`${look.title} — Batik NXT`, url:location.href }); else await navigator.clipboard.writeText(location.href); };
  return <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100svh-7rem)] lg:overflow-y-auto lg:pr-2"><p className="text-[10px] uppercase tracking-[.22em] text-black/45">Look {look.number}</p><h1 className="mt-4 font-display text-6xl leading-none sm:text-7xl">{look.title}</h1><p className="mt-6 text-sm leading-6 text-black/55">{look.description}</p><dl className="mt-10 divide-y divide-black/15 border-y border-black/15">{rows.map(([term,value]) => <div key={term} className="grid grid-cols-[7rem_1fr] gap-4 py-3 text-xs leading-5"><dt className="uppercase tracking-[.12em] text-black/45">{term}</dt><dd>{value}</dd></div>)}</dl><div className="mt-7 grid gap-2"><ActionButton onClick={() => setOpen(true)} className="bg-black text-ivory">Enquire About This Look</ActionButton><ActionButton onClick={() => setOpen(true)}>Request Private Viewing</ActionButton><button onClick={share} className="py-3 text-[10px] uppercase tracking-[.18em]">Share ↗</button></div><Modal open={open} onClose={() => setOpen(false)} title={`Enquiry · Look ${look.number}`}><InquiryForm lookId={look.id}/></Modal></aside>;
}
