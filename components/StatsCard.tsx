interface StatsCardProps {
  label: string;
  value: string | number;
  hint: string;
}

export function StatsCard({ label, value, hint }: StatsCardProps) {
  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-5 shadow-panel">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-xs text-zinc-500">{hint}</p>
    </div>
  );
}
