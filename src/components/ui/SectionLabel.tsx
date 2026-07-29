import { cn } from "@/src/lib/utils";
export function SectionLabel({ number, children, className }: { number?: string; children: string; className?: string }) { return <p className={cn("flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[.24em]", className)}>{number && <span className="text-current/50">{number}</span>}<span>{children}</span></p>; }
