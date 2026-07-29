"use client";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
export function PageTransition(){const pathname=usePathname();useEffect(()=>{window.scrollTo(0,0)},[pathname]);const label=pathname==="/"?"Batik NXT":pathname.split("/").filter(Boolean).at(-1)?.replaceAll("-"," ")??"Batik NXT";return <motion.div key={pathname} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[140] flex items-center justify-center bg-black text-ivory" initial={{y:"100%"}} animate={{y:["100%","0%","0%","-100%"]}} transition={{duration:.8,times:[0,.35,.55,1],ease:[.76,0,.24,1]}}><span className="text-[10px] font-semibold uppercase tracking-[.25em]">{label}</span></motion.div>}
