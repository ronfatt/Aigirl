import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/src/lib/utils";

const styles = "group inline-flex min-h-12 items-center justify-center gap-4 border px-5 text-[11px] font-semibold uppercase tracking-[.2em] transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current";
export function Button({ href, children, className = "", inverted = false }: { href: string; children: ReactNode; className?: string; inverted?: boolean }) {
  return <Link href={href} className={cn(styles, inverted ? "border-black/25 hover:bg-black hover:text-ivory" : "border-white/35 hover:bg-ivory hover:text-black", className)}>{children}<ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></Link>;
}
export function ActionButton({ children, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) { return <button className={cn(styles, "border-current", className)} {...props}>{children}</button>; }
