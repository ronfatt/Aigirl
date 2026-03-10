"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PenSquare, Settings, Sparkles, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/character", label: "Character", icon: Users },
  { href: "/generate", label: "Generate", icon: Sparkles },
  { href: "/posts", label: "Posts", icon: PenSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <div className="sticky top-0 z-30 border-b border-white/10 bg-card/85 px-4 py-4 backdrop-blur xl:hidden">
        <div className="mb-4">
          <p className="text-[11px] uppercase tracking-[0.32em] text-zinc-500">
            AI Persona Publisher
          </p>
          <h1 className="mt-2 text-lg font-semibold text-white">Creator Console</h1>
        </div>
        <nav className="flex gap-2 overflow-x-auto pb-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition",
                  active
                    ? "border-white/15 bg-white/10 text-white"
                    : "border-transparent bg-transparent text-zinc-400 hover:border-border hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-border bg-card/80 p-6 backdrop-blur xl:block">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.32em] text-zinc-500">AI Persona Publisher</p>
          <h1 className="mt-3 text-2xl font-semibold text-white">Creator Console</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Build realistic persona content flows with clean publishing controls.
          </p>
        </div>

        <nav className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition",
                  active
                    ? "border-white/15 bg-white/10 text-white"
                    : "border-transparent bg-transparent text-zinc-400 hover:border-border hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
