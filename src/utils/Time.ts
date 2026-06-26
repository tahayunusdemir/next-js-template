// Largest-first time units for relative formatting. Client-safe (no server env imports),
// so both server and client components can call `formatRelativeTime`.
const UNITS = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['week', 604_800],
  ['day', 86_400],
  ['hour', 3600],
  ['minute', 60],
  ['second', 1],
] as const;

/**
 * Formats a past (or future) date as a short, locale-aware relative time, e.g. "3h ago".
 * @param date - The date to format against now.
 * @param locale - The active locale identifier.
 * @returns The relative time string.
 */
export function formatRelativeTime(date: Date, locale: string) {
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'short' });
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);

  for (const [unit, perUnit] of UNITS) {
    if (Math.abs(seconds) >= perUnit) {
      return formatter.format(Math.round(seconds / perUnit), unit);
    }
  }

  return formatter.format(0, 'second');
}
