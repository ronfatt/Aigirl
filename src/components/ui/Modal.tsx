"use client";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab" && panel.current) {
        const nodes = panel.current.querySelectorAll<HTMLElement>('button,input,textarea,select,a[href]');
        if (!nodes.length) return;
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", key);
    return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", key); previous?.focus(); };
  }, [open, onClose]);
  return <AnimatePresence>{open && <div className="fixed inset-0 z-[90] flex items-end justify-end" role="dialog" aria-modal="true" aria-label={title}><motion.button aria-label="Close modal" className="absolute inset-0 bg-black/75" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} /><motion.div ref={panel} tabIndex={-1} className="relative max-h-[94svh] w-full overflow-y-auto bg-ivory p-6 text-black outline-none sm:max-w-2xl sm:p-10" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ duration: .55, ease: [.76,0,.24,1] }}><button onClick={onClose} aria-label="Close" className="absolute right-6 top-6 p-2 focus-visible:outline"><X /></button><p className="mb-8 text-[10px] font-bold uppercase tracking-[.25em]">{title}</p>{children}</motion.div></div>}</AnimatePresence>;
}
