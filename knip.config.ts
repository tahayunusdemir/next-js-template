import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  // Standalone scripts invoked manually via the CLI (e.g. tsx src/scripts/…)
  entry: ['src/scripts/**/*.ts'],
  // Files to exclude from Knip analysis
  ignore: [
    'checkly.config.ts',
    'src/libs/I18n.ts',
    'src/types/I18n.ts',
    'src/components/ui/**', // Vendored shadcn/ui primitives keep their full API surface
  ],
  // Dependencies to ignore during analysis
  ignoreDependencies: [
    '@clerk/shared',
    '@swc/helpers', // Avoid error in CI: "`npm ci` can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync."
    // Only consumed by vendored shadcn/ui primitives (ignored above), so Knip can't see their usage
    'embla-carousel-react',
    'input-otp',
    'react-day-picker',
    'react-resizable-panels',
  ],
  // Include custom Playwright test file suffixes
  playwright: {
    entry: ['tests/**/*.@(integ|e2e).ts'],
  },
  // Binaries to ignore during analysis
  ignoreBinaries: [
    'production', // False positive raised with dotenv-cli
  ],
  compilers: {
    css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/gu)].join('\n'),
  },
  treatConfigHintsAsErrors: true,
};

export default config;
