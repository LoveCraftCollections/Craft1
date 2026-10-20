# LoveCraft: Mana Pelli

A responsive, bilingual Telugu and English wedding invitation with three reusable visual themes. Sravani and Karthik are fictional demo content, not customers; edit `src/lib/wedding.ts` to try other wedding configurations.

## Run Locally

Prerequisites: Node.js 20 or newer and npm.

```sh
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the design preview or [http://localhost:3000/w/sravani-karthik](http://localhost:3000/w/sravani-karthik) for the shareable invitation. Templates and the language switcher work without an account or external service. Run `npm test`, `npx tsc --noEmit` and `npm run build` to check the project.

## Structure

```text
src/
	app/                   App Router pages, global responsive styles and metadata
	app/w/[slug]/          Published invitation route and per-wedding share metadata
	components/            Typed, reusable invitation sections and theme selector
	lib/wedding.ts          Zod schema, fictional demo, timezone and theme helpers
	lib/validation.ts       Reusable RSVP validation
	lib/wedding.test.ts     Configuration, RSVP, timezone and theme tests
public/wedding-couple.jpg Local demo image (replace with customer-approved imagery)
supabase/migrations/     Tenant, invitations, private RSVPs and storage policies
```

## Configuring a Wedding

Edit the exported `demoWedding` object in `src/lib/wedding.ts`. `WeddingConfig` is inferred from its Zod schema; `weddingConfigSchema.parse` validates it before use. Bilingual names and text, event dates, the ceremony timezone, visibility switches, opening screen, theme tokens and optional gallery photos travel with the same object. The selector changes its theme without replacing its content. The share route currently serves that one published demo slug and returns 404 for other slugs.

The guest-facing RSVP form validates input locally and intentionally does **not** transmit or persist it. Its confirmation says so. Gallery fields accept local paths or HTTPS image URLs; the included sample photograph is bundled locally.

## Supabase Setup

The initial migration is a starting point, not a connected or production-verified backend. Create a Supabase project, install the [Supabase CLI](https://supabase.com/docs/guides/cli), then link and apply the migration:

```sh
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Add trusted LoveCraft administrator user IDs to `public.lovecraft_admins` using the Supabase SQL editor. Weddings have an `owner_id`, constrained slug, JSON configuration and draft/published/disabled status. RLS allows public reads only for published weddings; RSVP inserts do not grant guests read access; only the wedding owner or a seeded LoveCraft administrator can view responses. Photo objects are in a private bucket partitioned by wedding UUID, with access limited to published invitations and authorized hosts.

Copy `.env.example` to `.env.local` and set the project URL, public anonymous key and public site origin. The service-role key is optional and **server-only**; never expose it to the browser. Environment variables alone do not connect Supabase: the data-access client, authorized admin UI, server-side RSVP endpoint and image upload workflow still need implementing. Publish through a trusted server action or API, not a public client update. Validate the actual project's RLS behavior before launch.

## Deployment

The repository includes a `vercel.json` for Next.js builds and a GitHub Actions workflow that runs the security audit, tests, type check and production build on pushes to `main` and pull requests. To deploy, import this GitHub repository in the Vercel dashboard and let Vercel detect the Next.js framework. Set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS domain in the Vercel project's Production, Preview and Development environments, then deploy. Vercel automatically builds future Git pushes. Apply Supabase migrations separately; do not expose service credentials to client-side variables. A live Vercel project and production URL require authorization in a Vercel account.

## Implemented

- Rajam, Aarambham and Mana Pelli themes using one strongly typed wedding configuration.
- Telugu/English language switch, fictional family details and editable localized content.
- Invitation opening, responsive couple hero, family invitation, configurable events and venue-local countdown.
- Venue details, directions, contact link, calendar hand-off, privacy-labeled RSVP preview, WhatsApp sharing and SEO/Open Graph metadata.
- Optional responsive gallery and keyboard-accessible lightbox; empty galleries disappear.
- A `/w/[slug]` page with published-only demo routing and safe not-found behavior.
- Zod configuration and RSVP tests, venue timezone tests, template preservation checks, and a Supabase schema/RLS starting migration.

## Not Yet Connected

There is no administrator sign-in or CRUD dashboard, durable wedding storage, customer-specific database routing, persisted/deduplicated RSVP service, authentication, photo upload, QR-code generation, real admin template preview, or deployment pipeline. The migration and environment template are scaffolding, not evidence of a tested production access boundary. The optional Google Fonts stylesheet also has system Telugu and serif fallbacks.