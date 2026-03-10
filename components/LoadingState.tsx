export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-8">
      <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
      <div className="mt-4 h-20 animate-pulse rounded-2xl bg-white/5" />
      <p className="mt-4 text-sm text-zinc-500">{label}...</p>
    </div>
  );
}
