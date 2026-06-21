# Nextjs Starter

A starter template built on Next.js 16 (App Router), Tailwind CSS 4, and TypeScript. It ships with authentication, database, internationalization, security, and a full testing setup so you can start building features right away.

## Features

- ⚡ [Next.js](https://nextjs.org) with App Router and React 19 (React Compiler)
- 🔥 Type checking with [TypeScript](https://www.typescriptlang.org), strict mode enabled
- 💎 Styling with [Tailwind CSS](https://tailwindcss.com)
- 🔒 Authentication with [Clerk](https://clerk.com): sign up, sign in, sign out, forgot/reset password, MFA, social and passwordless login
- 📦 Type-safe ORM with DrizzleORM (PostgreSQL, SQLite, MySQL)
- 💽 Local development database with PGlite — no Docker required
- 🌐 Multi-language (i18n) with [next-intl](https://next-intl.dev) and [Crowdin](https://crowdin.com)
- ♻️ Type-safe environment variables with T3 Env
- ⌨️ Form handling with React Hook Form and validation with Zod
- 📏 Linting and formatting with [Ultracite](https://www.ultracite.ai) (Oxlint + Oxfmt)
- 🦊 Git hooks with Lefthook and commit linting with Commitlint
- 🔍 Unused files/dependencies detection with Knip and i18n validation with i18n-check
- 🦺 Unit testing with Vitest (browser mode) and E2E testing with Playwright
- 🎉 Storybook for isolated UI development
- 🐰 AI-powered code reviews with [CodeRabbit](https://www.coderabbit.ai)
- 🚨 Error monitoring with [Sentry](https://sentry.io) (and Spotlight for local development)
- 📝 Logging with LogTape and log management with [Better Stack](https://betterstack.com)
- 🖥️ Monitoring as Code with [Checkly](https://www.checklyhq.com)
- 🔐 Security and bot protection with [Arcjet](https://arcjet.com)
- 🤖 SEO metadata, JSON-LD, Open Graph tags, `sitemap.xml`, and `robots.txt`
- 💡 Absolute imports using the `@` prefix
- 🗂 VSCode configuration: debug, settings, tasks, and extensions

## Requirements

- Node.js 24+ and npm

## Getting started

```shell
git clone --depth=1 https://github.com/tahayunusdemir/next-js-template.git my-project-name
cd my-project-name
npm install
```

Run the project in development mode with live reload:

```shell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The project comes pre-configured with a local PGlite database, so no extra setup is required to run it locally.

## Set up authentication

Create an account at [Clerk](https://clerk.com) and create a new application in the Clerk Dashboard. Copy the `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` values into your `.env.local` file (not tracked by Git):

```shell
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_pub_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

You now have a working authentication system: sign up, sign in, sign out, forgot/reset password, update profile, update password, update email, delete account, and more.

## Set up remote database

The project uses DrizzleORM and works out of the box with any PostgreSQL provider. When you first launch the project locally, a PostgreSQL-compatible database is created automatically via PGlite — no Docker or extra setup needed.

For production, create a PostgreSQL database with the provider of your choice (for example, [Neon](https://neon.tech) or [Supabase](https://supabase.com)) and copy the connection string into the `DATABASE_URL` variable in your `.env.production` file.

### Create a fresh and empty database

To reset your local database, delete the `local.db` folder at the project root. A new database is created automatically the next time you run the project.

## Translation (i18n) setup

The project uses `next-intl` together with [Crowdin](https://crowdin.com). As a developer, you only maintain the default language (English); translations for other languages are generated and managed through Crowdin.

To set it up, create a Crowdin project and a Personal Access Token (Account Settings > API). Then define `CROWDIN_PROJECT_ID` and `CROWDIN_PERSONAL_TOKEN` as secrets in your GitHub Actions. Localization files are synchronized with Crowdin on every push to the `main` branch.

## Project structure

```shell
.
├── .github                 # GitHub Actions workflows and reusable actions
├── .storybook              # Storybook configuration
├── .vscode                 # VSCode configuration
├── docs                    # Project documentation
├── migrations              # Database migrations
├── public                  # Public assets
├── src
│   ├── app                 # Next.js App Router
│   ├── components          # React components
│   ├── libs                # Third-party library configuration
│   ├── locales             # i18n messages
│   ├── models              # Database models (Drizzle schema)
│   ├── styles              # Global styles
│   ├── templates           # Layout templates
│   ├── types               # Type definitions
│   ├── utils               # Utilities
│   └── validations         # Zod validation schemas
└── tests
    ├── e2e                 # E2E tests (and Monitoring as Code)
    └── integration         # Integration tests
```

## Customization

Search the project for `FIXME:` to find the quickest customization points. The most important files:

- `public/favicon.ico`, `public/apple-touch-icon.png`, `public/favicon-16x16.png`, `public/favicon-32x32.png`: your favicon
- `src/utils/AppConfig.ts`: application configuration (name, locales)
- `src/templates/BaseTemplate.tsx`: default theme/layout
- `next.config.ts`: Next.js configuration
- `.env`: default environment variables

## Change database schema

Update the schema file at `src/models/Schema.ts`, then generate a migration:

```shell
npm run db:generate
```

With your database running, apply the migration:

```shell
npm run db:migrate
```

There is no need to restart the Next.js server for the changes to take effect.

## Commit message format

The project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification. An interactive CLI helps you write compliant messages:

```shell
npm run commit
```

Every message must begin with a type prefix (e.g. `feat: add login page`):

| Type | Description |
| --- | --- |
| `feat` | New feature or functionality |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code formatting without logic changes |
| `refactor` | Code restructuring without behavior changes |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `build` | Build system |
| `ci` | CI configuration and scripts |
| `chore` | Maintenance tasks (dependencies, config) |
| `revert` | Reverts a previous commit |

## Testing

Unit tests live alongside the source code and use the `*.test.ts` / `*.test.tsx` naming. The project uses Vitest with browser mode:

```shell
npm run test
```

### Integration & E2E testing

Integration tests use the `*.integ.ts` extension and E2E tests use `*.e2e.ts`, both powered by Playwright:

```shell
npx playwright install # Only needed once per environment
npm run test:e2e
```

## Storybook

Stories live alongside components and follow the `*.stories.ts` / `*.stories.tsx` pattern. Run Storybook in development mode:

```shell
npm run storybook
```

It starts on [http://localhost:6006](http://localhost:6006). To run Storybook tests in headless mode:

```shell
npm run storybook:test
```

## Local production build

Generate an optimized production build locally using a temporary in-memory Postgres database:

```shell
npm run build-local
```

This starts a temporary in-memory database, runs migrations with Drizzle Kit, builds the Next.js app, and shuts the database down when finished. It only creates the build — run `npm run start` to serve it.

## Deploy to production

Database migrations run automatically during the build, so you don't need to run them manually. You must define `DATABASE_URL` in your environment. Then build and start:

```shell
npm run build
npm run start
```

You also need to set `CLERK_SECRET_KEY` with your own key. Open [http://localhost:3000](http://localhost:3000) to view the production build.

## Error monitoring

The project uses [Sentry](https://sentry.io) for error monitoring.

In development, no setup is required: Sentry is paired with Spotlight, so all errors are captured locally without sending data to Sentry Cloud. Inspect events at [http://localhost:8969](http://localhost:8969).

For production, create a Sentry project and set the following variables in `.env.production`:

```shell
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_ORGANIZATION=
SENTRY_PROJECT=
```

You also need to create a `SENTRY_AUTH_TOKEN` variable in your hosting provider's dashboard.

## Code coverage

Code coverage reporting uses [Codecov](https://about.codecov.io). Connect Codecov to your GitHub account, copy the repository token, and define it as a `CODECOV_TOKEN` secret in GitHub Actions (do not commit it to source).

## Logging

The project uses LogTape. In development, logs are printed to the console by default.

For production it integrates with [Better Stack](https://betterstack.com): create a source (Sources > Connect source, platform Node.js), then set `NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN` and `NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST` in your environment variables.

## Checkly monitoring

[Checkly](https://www.checklyhq.com) runs tests ending with `*.check.e2e.ts` at regular intervals and notifies you if any fail. Create a Checkly account, generate an API key, and set `CHECKLY_API_KEY` and `CHECKLY_ACCOUNT_ID` as secrets in GitHub Actions. Finally, update `checkly.config.ts` with your own email address and production URL.

## Arcjet security and bot protection

[Arcjet](https://arcjet.com) provides defense-in-depth security as code. Create a free account, get your API key, and set it in the `ARCJET_KEY` environment variable. Two features are configured:

- **Bot detection** — allows search engines, link previews, and uptime monitors while blocking scrapers and AI crawlers.
- **Arcjet Shield WAF** — detects and blocks common attacks such as SQL injection and cross-site scripting.

The central client is defined in `src/libs/Arcjet.ts`, with additional rules applied in `proxy.ts`.

## Useful commands

Code quality and validation:

- `npm run lint` — check for linting errors
- `npm run lint:fix` — automatically fix fixable issues
- `npm run check:types` — verify type safety across the project
- `npm run check:deps` — find unused dependencies and files
- `npm run check:i18n` — ensure translations are complete and valid

Bundle analyzer:

```shell
npm run build-stats
```

Database studio (explore the database with Drizzle Studio):

```shell
npm run db:studio
```

## Documentation

See the [`docs/`](./docs/index.md) folder for template customization guides.

## License

See the [LICENSE](./LICENSE) file.
