import { GenerationStatus, PostStatus, RiskLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: PostStatus | GenerationStatus | RiskLevel;
}

const toneMap: Record<string, string> = {
  draft: "bg-zinc-800 text-zinc-200",
  completed: "bg-blue-500/15 text-blue-200",
  approved: "bg-emerald-500/15 text-emerald-200",
  published: "bg-emerald-500/15 text-emerald-200",
  queued: "bg-amber-500/15 text-amber-200",
  failed: "bg-rose-500/15 text-rose-200",
  safe: "bg-emerald-500/15 text-emerald-200",
  suggestive: "bg-amber-500/15 text-amber-200",
  restricted: "bg-rose-500/15 text-rose-200",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        toneMap[status] ?? "bg-zinc-800 text-zinc-200",
      )}
    >
      {status}
    </span>
  );
}
