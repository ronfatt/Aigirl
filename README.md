# AI Persona Publisher

AI Persona Publisher is a Next.js 15 MVP for managing AI lifestyle personas, generating draft visuals, creating short captions, and preparing content for Facebook and Instagram publishing.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Vercel-ready configuration
- Mock-first service abstractions for OpenAI, Replicate, Vercel Blob, and Meta Graph API

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Start the app:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Environment variables

All secrets are read server-side only.

- `OPENAI_API_KEY`: connect a real caption generation provider
- `OPENAI_CAPTION_MODEL`: optional, defaults to `gpt-4o-mini`
- `REPLICATE_API_TOKEN`: connect Replicate Flux or another image provider
- `REPLICATE_MODEL`: optional, defaults to `black-forest-labs/flux-dev`
- `BLOB_READ_WRITE_TOKEN`: enable Vercel Blob storage
- `META_ACCESS_TOKEN`: Meta Graph API access token
- `META_IG_BUSINESS_ID`: Instagram Business account ID
- `META_FB_PAGE_ID`: Facebook Page ID
- `DATABASE_URL`: Postgres or Supabase connection string

## Architecture notes

- `lib/db.ts` is an in-memory repository so the app works locally without external services.
- Route handlers already call the repository and service abstractions, so replacing the mock database with Supabase or Postgres is isolated work.
- `lib/image-generator.ts` contains the hook point for Replicate Flux.
- `lib/replicate.ts` wraps the Replicate prediction lifecycle and keeps the provider isolated.
- `lib/caption-generator.ts` generates three caption options with OpenAI and falls back to mock captions when the API key is missing.
- `lib/openai.ts` holds the shared OpenAI client setup.
- `lib/blob.ts` contains the hook point for Vercel Blob storage.
- `lib/meta-publisher.ts` contains the hook point for the Meta Graph API publish flow.
- If Meta credentials are missing, publishing falls back to mock responses so local development still works.

## Routes

- `GET /api/dashboard`
- `GET /api/characters`
- `POST /api/characters`
- `PUT /api/characters/[id]`
- `POST /api/generate-image`
- `POST /api/generate-caption`
- `GET /api/posts`
- `PUT /api/posts/[id]`
- `POST /api/publish`

## Seed data

The app ships with:

- 20 seeded scene templates in [`lib/scene-library.ts`](/Users/rms/Desktop/Ai Project/AiGirl/lib/scene-library.ts)
- 1 seeded persona
- 1 seeded approved generation
- 1 seeded draft post

## Deployment

This project is ready for Vercel deployment.

- Add environment variables in the Vercel project settings
- Deploy directly from the repository
- `vercel.json` includes a starter cron definition for future automation work
