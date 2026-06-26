import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './migrations',
  schema: './src/models/Schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    // Migrations run over the direct/session pooler in production (DIRECT_URL); locally that
    // is blank so we fall through to DATABASE_URL (PGlite). `||` (not `??`) so a blank
    // DIRECT_URL="" falls back too. See docs/cinepersona-docs/supabase-migration.md §3.
    // oxlint-disable-next-line typescript/prefer-nullish-coalescing
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || '',
  },
  verbose: true,
  strict: true,
});
