# The Fridge

An ICE/FROZEN-themed sneaker e-commerce storefront — browse, cart, checkout
(cash on delivery, no online payment processor), customer accounts with order
history, and an admin panel for managing products and orders.

Live at [thefridge.store](https://thefridge.store).

## Tech stack

- **Next.js 16** (App Router, Turbopack) — see `AGENTS.md`, this project
  tracks a newer Next.js release than most docs/training data assume.
- **React 19**
- **Drizzle ORM** + **Neon Postgres** (serverless Postgres)
- **Tailwind CSS v4**
- **Vercel Blob** for product image uploads
- Deployed on **Vercel**, domain registered at GoDaddy

## Local development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in real values:
   - `DATABASE_URL` — your Neon Postgres connection string (pooled connection,
     from the Neon dashboard's "Connect" button).
   - `AUTH_SECRET` — a random secret that signs customer login session
     cookies. Generate one with `openssl rand -hex 32`. Anyone with this
     value can forge a signed-in session for any account, so keep it private
     and never commit it.
   - `BLOB_READ_WRITE_TOKEN` — only needed if you're testing product image
     uploads locally. On Vercel this is auto-provided once Blob storage is
     attached to the project; you don't need to set it manually there.
3. Run the dev server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

Other useful scripts:
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript, no emit
- `npm run build` — production build (same thing CI runs)
- `npm run seed` — bulk-import products from a CSV (see `scripts/seed.ts` for
  the expected columns)

## Database & migrations

This project uses Drizzle's **migration-file workflow**, not `db push`-only:

- `npm run db:generate` — diffs `src/db/schema.ts` against the last snapshot
  and writes a new SQL file into `./drizzle`. This does **not** touch your
  database, it only generates a file.
- `npm run db:push` — applies the current schema directly to whatever
  database `DATABASE_URL` points to (syncs the live schema to match
  `schema.ts`, regardless of the migration files).

In practice: after changing `src/db/schema.ts`, run `db:generate` to produce
a migration file for the history, then run `db:push` (or apply the generated
`.sql` file directly in Neon's SQL editor) against the real database to
actually apply it.

**Check `./drizzle` for any migration file that looks newer than what's been
applied to production** — a generated migration sitting unapplied means a
schema change exists in code that the live database doesn't know about yet
(this has happened before with the `unisex` audience value).

## Admin access

There's no separate admin login or admin signup form. Admin access is just a
column:

1. Sign up for a normal account on the site (`/login`, switch to "Sign up").
2. In the database, set `users.is_admin = true` for that account's row.
3. That account can now see the "ADMIN" link in the header and reach
   `/admin` — managing products and orders.

`/admin/*` is protected twice: once by `src/proxy.ts` (redirects non-admins
away before the page even renders) and again inside every `/api/admin/*`
route handler (checks `isAdminRequestAuthorized()` independently). Both need
to agree a user is an admin, so there's no single point of failure there.

## Deployment

- Hosted on **Vercel**, connected to this GitHub repo — pushing to the
  tracked branch deploys automatically.
- **GitHub Actions** (`.github/workflows/ci.yml`) runs lint, typecheck, and a
  full build on every push and pull request. A red check there means
  something is broken before it ever reaches Vercel.
- Required environment variables in the Vercel project (Settings →
  Environment Variables): `DATABASE_URL`, `AUTH_SECRET`. `BLOB_READ_WRITE_TOKEN`
  is set automatically once Blob storage is attached to the project.
- Custom domain (`thefridge.store` + `www.thefridge.store`) is configured
  under Vercel's Domains settings, with DNS records pointed at Vercel from
  GoDaddy's DNS panel for that domain.

## Project structure (high level)

- `src/app/` — routes (App Router). `src/app/admin/` is the admin panel,
  `src/app/api/` is route handlers (REST-ish endpoints + admin API).
- `src/db/` — Drizzle schema (`schema.ts`), read queries (`queries.ts`),
  and mutations (`mutations.ts` for customer-facing writes like checkout,
  `adminMutations.ts` for admin writes).
- `src/components/` — UI components.
- `src/lib/` — shared logic: auth/session handling, password hashing, rate
  limiting, shipping/delivery-estimate tables, audience/brand constants, etc.
- `drizzle/` — generated SQL migration files + schema snapshots.
