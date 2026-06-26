'use client';

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Env } from '@/libs/Env';

// Browser-only Supabase client used solely for Realtime (chat). All persistent data still goes
// through the `pg` pool + Drizzle (src/libs/DB.ts); Supabase here is the live transport only.
//
// Auth bridges to Clerk: every request and Realtime channel authenticates with the current
// Clerk session token via the `accessToken` hook, so RLS sees `auth.jwt() ->> 'sub'` = the
// Clerk user id (= profile.id). See docs/cinepersona-docs/supabase-migration.md §6.6.

// Latest Clerk token getter, registered from a React component that has the Clerk session.
let getClerkToken: (() => Promise<string | null>) | null = null;

/**
 * Registers the Clerk session token getter the Supabase client reads on each request/refresh.
 * @param getter - Returns the current Clerk session JWT, or null when signed out.
 */
export function setClerkTokenGetter(getter: () => Promise<string | null>) {
  getClerkToken = getter;
}

let client: SupabaseClient | null = null;

/**
 * Returns the shared browser Supabase client. One client (one websocket) per tab.
 * @returns The Supabase client, or null when Realtime is not configured (e.g. local
 * PGlite-only dev) so callers can fall back to SSR refresh.
 */
export function getSupabaseBrowserClient() {
  if (!(Env.NEXT_PUBLIC_SUPABASE_URL && Env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    return null;
  }

  // With `accessToken` set, supabase-js uses the Clerk token for every request and Realtime
  // channel and disables its own auth flows — so no session persistence/refresh config needed.
  client ??= createClient(Env.NEXT_PUBLIC_SUPABASE_URL, Env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    accessToken: async () => (getClerkToken ? await getClerkToken() : null),
  });

  return client;
}
