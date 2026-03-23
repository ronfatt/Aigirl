interface HeaderProps {
  title: string;
  description: string;
}

export function Header({ title, description }: HeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-2 border-b border-white/5 pb-6">
      <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Manual IG studio</p>
      <h2 className="text-3xl font-semibold text-white">{title}</h2>
      <p className="max-w-2xl text-sm text-zinc-400">{description}</p>
    </div>
  );
}
