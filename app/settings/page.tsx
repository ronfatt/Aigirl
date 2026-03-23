import { Header } from "@/components/Header";

const envKeys = [
  "OPENAI_API_KEY",
  "REPLICATE_API_TOKEN",
  "REPLICATE_VIDEO_MODEL",
  "DATABASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_STORAGE_BUCKET",
];

const docs = [
  {
    title: "OpenAI",
    description: "Connect a real caption model in lib/caption-generator.ts.",
  },
  {
    title: "Replicate",
    description: "Connect Flux for image generation now, and optionally set REPLICATE_VIDEO_MODEL when you are ready to swap the local clip draft builder for a real video provider.",
  },
  {
    title: "Supabase Storage",
    description: "Persist generated image assets via lib/storage.ts with a server-side service role key.",
  },
  {
    title: "Manual IG Workflow",
    description: "This platform now focuses on generating downloadable images, caption drafts, and short clip-ready assets for manual Instagram posting.",
  },
  {
    title: "Database",
    description: "Swap the in-memory repository for Postgres or Supabase while keeping the route handlers stable.",
  },
];

export default function SettingsPage() {
  return (
    <div>
      <Header
        title="Settings"
        description="Keep generation and storage credentials server-side only. This page documents the manual asset workflow without exposing secret values."
      />

      <div className="grid gap-6 xl:grid-cols-[0.85fr,1.15fr]">
        <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <h3 className="text-lg font-semibold text-white">Environment keys</h3>
          <p className="mt-2 text-sm text-zinc-400">
            Add these to `.env.local` locally and to the Vercel project settings in production.
          </p>

          <div className="mt-5 space-y-3">
            {envKeys.map((key) => (
              <div
                key={key}
                className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3 font-mono text-sm text-zinc-200"
              >
                {key}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {docs.map((item) => (
            <div
              key={item.title}
              className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-6 shadow-panel"
            >
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
