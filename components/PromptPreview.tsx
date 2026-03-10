export function PromptPreview({ prompt }: { prompt: string }) {
  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 shadow-panel">
      <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Prompt Preview</p>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-zinc-300">{prompt}</p>
    </div>
  );
}
