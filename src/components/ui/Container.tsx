import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils";
export function Container({ children, className }: { children: ReactNode; className?: string }) { return <div className={cn("mx-auto w-full max-w-[1600px] px-5 sm:px-8 lg:px-12 xl:px-16", className)}>{children}</div>; }
