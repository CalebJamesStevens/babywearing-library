# Babywearing Library

Monorepo with a public library app and a separate admin app.

## Apps

- `apps/web`: Public catalog and member checkout requests
- `apps/admin`: Inventory + membership admin
- `packages/db`: Drizzle schema and Neon connection

## Setup

1. Copy `.env.example` to `.env.local` at the repo root and fill in values.
2. Install dependencies with `pnpm install`.
3. Run `pnpm db:generate` and `pnpm db:migrate` to create tables.
4. Start dev servers with `pnpm dev`.

## Environment variables

- `DATABASE_URL`: Neon Postgres connection string
- `NEON_AUTH_BASE_URL`: Neon Auth base URL (example: https://YOUR.neonauth.../neondb/auth)
- `NEON_AUTH_COOKIE_SECRET`: Random 32+ char secret used to sign session cookies
- `WEB_BASE_URL`: Public web app base URL (used for QR codes)
- `ADMIN_ROLE`: Role claim required to access admin

## Notes

- QR codes point to `/carriers/[instanceId]` on the web app.
- Checkout requests create `pending` rows. Admin approves/denies in the admin app.
- Notification delivery (email/text) should be integrated in `apps/admin/src/app/checkouts/page.tsx` after approval or in a webhook worker.
