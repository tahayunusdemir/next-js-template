# supabase/

Supabase-platform SQL that is **not** part of the Drizzle migration pipeline in `migrations/`.

`migrations/` runs against **both** local PGlite and production Supabase (via `db:migrate`).
Anything here depends on Supabase-only schemas (`realtime`, `auth`, RLS on `realtime.messages`)
that PGlite does not have, so it must be applied to **Supabase only** — never to PGlite.

## Files

- `migrations/20260626120000_realtime_messaging.sql` — Broadcast trigger on `public.message`
  + Realtime authorization (RLS) so only conversation members can join a chat channel.

## Applying it

Pick one:

- **SQL Editor** — paste the file contents into the Supabase Dashboard → SQL Editor and run.
- **Supabase CLI** — `supabase link --project-ref <ref>` then `supabase db push` (this folder
  follows the CLI's `supabase/migrations/<timestamp>_name.sql` convention).

## Before it works (Dashboard, one-time)

1. **Clerk → Supabase third-party auth** so `auth.jwt() ->> 'sub'` = the Clerk user id:
   Clerk Dashboard → Connect with Supabase, then Supabase → Authentication → Third-Party Auth → Clerk.
2. **Private channels** — Project Settings → Realtime → turn **off** "Allow public access".

See `docs/cinepersona-docs/supabase-migration.md` §6 for the full rationale.
