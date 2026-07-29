# Batik NXT

## 1. Project Overview

Batik NXT is a mobile-first editorial fashion website for a contemporary Malaysian luxury concept brand. It presents batik as a living design language through collections, look details, craft studies, journal stories and private enquiries. This release contains no prices, cart, checkout or fabricated inventory.

## 2. Tech Stack

- Next.js 16 App Router, React 19 and strict TypeScript
- Tailwind CSS design tokens
- GSAP + ScrollTrigger for large scroll narratives
- Motion for overlays, filtering and UI transitions
- React Hook Form + Zod for validated forms
- Lucide React icons and `next/image`
- Cormorant Garamond + Inter through `next/font/google`

## 3. Installation

```bash
npm install
```

Node.js 20 or newer is recommended.

## 4. Development Command

```bash
npm run dev
```

Open `http://localhost:3000`.

## 5. Production Build

```bash
npm run typecheck
npm run lint
npm run build
npm start
```

## 6. Folder Structure

```text
app/                     Routes, metadata, API mocks, errors and SEO files
src/components/          Layout, home, collection, look, journal, forms, media and motion
src/content/en.ts        Shared English brand copy
src/data/                Collections, looks, journal, navigation and settings
src/lib/repositories/    Local-data repository boundary for a future CMS
src/types/               Media, SEO and content domain types
public/images/           Local, proportion-safe image assets by content category
```

Legacy AI studio pages and APIs that predated this website remain in the repository and were not deleted. They are not linked from the Batik NXT public navigation.

## 7. Replacing Images

Replace files under `public/images/` or change paths in `src/data`. Keep declared dimensions, aspect ratio, alt text and focal point accurate. `ResponsiveImage` supplies responsive sizing, lazy loading and a local fallback. Use JPG, PNG, WebP or AVIF production photography; reserve `priority` for the first meaningful image.

## 8. Editing Brand Content

Global brand details and placeholder emails live in `src/data/settings.ts`. Shared home copy lives in `src/content/en.ts`. Collection, look and journal text lives in typed records under `src/data`. The locale list already reserves `en`, `zh` and `ms`.

## 9. Adding a Collection

Add a complete `Collection` record to `src/data/collections.ts`, use a unique `id` and `slug`, add image assets, and list valid look IDs in `lookIds`. Published records automatically appear in repositories, static routes, search and the sitemap.

## 10. Adding a Look

Add the full look specification in `src/data/looks.ts`, reference an existing `collectionId`, and update that collection's `lookIds`. Every image needs descriptive alt text and dimensions. The slug becomes `/looks/[slug]`.

## 11. Adding a Journal Article

Add a `JournalArticle` to `src/data/journal.ts`. Content supports paragraph, heading, quote and inline image blocks. Use ISO dates and valid related article IDs.

## 12. Form Integration

`/api/contact` and `/api/newsletter` validate requests and return explicit mock responses. They do not send email or persist personal data. Replace route internals with Resend, Mailchimp or database operations while retaining the client payload and Zod boundary.

## 13. Environment Variables

```bash
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
```

Future provider keys must be server-only (for example `RESEND_API_KEY`) and must never use the `NEXT_PUBLIC_` prefix.

## 14. Deployment

Set `NEXT_PUBLIC_SITE_URL`, run the production checks, and import the repository into Vercel. No custom build command is required. Replace placeholder legal text, email addresses and social profile URLs before public launch.

## 15. Future CMS Integration

Pages use functions in `src/lib/repositories` instead of raw arrays. Replace repository internals with Sanity, Strapi, Supabase or PostgreSQL queries while preserving return types. The domain can grow into inventory, accounts, wishlists, appointments, made-to-measure requests, event registration and a buyer portal without rewriting page components.
