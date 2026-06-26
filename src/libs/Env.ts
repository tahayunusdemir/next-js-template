import { createEnv } from '@t3-oss/env-nextjs';
import * as z from 'zod';

export const Env = createEnv({
  server: {
    ARCJET_KEY: z.string().startsWith('ajkey_').optional(),
    CLERK_SECRET_KEY: z.string().min(1),
    DATABASE_URL: z.string().min(1),
    // Direct (session-pooler) connection used only for migrations / DDL by drizzle-kit.
    // Blank locally so drizzle.config falls back to DATABASE_URL (PGlite); on Vercel set it
    // to Supabase's session pooler (5432) while runtime queries use DATABASE_URL (transaction
    // pooler, 6543). See docs/cinepersona-docs/supabase-migration.md §3.
    DIRECT_URL: z.string().min(1).optional().or(z.literal('')),
    // TMDB API Read Access Token (Bearer) — server-only. Optional so the app still
    // builds without it; the film detail page and the importer require it at runtime.
    // `.or('')` lets the env files list the key blank without breaking boot.
    TMDB_API_READ_TOKEN: z.string().min(1).optional().or(z.literal('')),
    // Stripe billing — optional until checkout goes live. `.or('')` lets the env
    // files list the keys blank without breaking boot.
    STRIPE_SECRET_KEY: z.string().startsWith('sk_').optional().or(z.literal('')),
    STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_').optional().or(z.literal('')),
    // Shared bearer secret guarding the CineMatch sweep endpoint, so only the scheduler can
    // trigger the fallback / re-evaluation pass. Optional; when blank the route is disabled.
    CINEMATCH_CRON_SECRET: z.string().min(1).optional().or(z.literal('')),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().optional(),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
    // Supabase Realtime (chat) — public project URL + anon/publishable key. Optional so local
    // PGlite-only dev still boots; when blank the chat falls back to SSR refresh (no live push).
    NEXT_PUBLIC_SUPABASE_URL: z.url().optional().or(z.literal('')),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().or(z.literal('')),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_').optional().or(z.literal('')),
    NEXT_PUBLIC_LOGGING_LEVEL: z
      .enum(['error', 'info', 'debug', 'warning', 'trace', 'fatal'])
      .default('info'),
    NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN: z.string().optional(),
    NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST: z.string().optional(),
  },
  shared: {
    NODE_ENV: z.enum(['test', 'development', 'production']).optional(),
  },
  // You need to destructure all the keys manually
  runtimeEnv: {
    ARCJET_KEY: process.env.ARCJET_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    TMDB_API_READ_TOKEN: process.env.TMDB_API_READ_TOKEN,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    CINEMATCH_CRON_SECRET: process.env.CINEMATCH_CRON_SECRET,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_LOGGING_LEVEL: process.env.NEXT_PUBLIC_LOGGING_LEVEL,
    NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN: process.env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN,
    NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST: process.env.NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST,
    NODE_ENV: process.env.NODE_ENV,
  },
});
