import * as z from 'zod';

/** Maximum length of a profile bio, in characters. */
export const BIO_MAX = 160;
/** Maximum length of the profile website URL, in characters. */
const WEBSITE_MAX = 2048;
/** Maximum length of a Clerk first/last name, in characters. */
export const NAME_MAX = 50;

// Optional free text that also accepts an empty string (cleared field).
const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(''));

// Owned-by-us profile fields. Persisted by the `saveProfile` server action. The
// single website is platform-aware at render (icon + short handle); see lib/socials.
// The website is restricted to http(s) so a stored `javascript:`/`mailto:` URL can
// never render as an active link.
export const ProfileValidation = z.object({
  bio: optionalText(BIO_MAX),
  country: z
    .string()
    .regex(/^[A-Z]{2}$/u)
    .optional()
    .or(z.literal('')),
  website: z
    .url({ protocol: /^https?$/u })
    .max(WEBSITE_MAX)
    .optional()
    .or(z.literal('')),
});

// Full editor payload. The name is applied to Clerk on the client; the rest go through
// the server action. The handle (username) is immutable and the avatar is handled
// separately, so neither is part of this payload.
export const ProfileFormValidation = ProfileValidation.extend({
  firstName: optionalText(NAME_MAX),
  lastName: optionalText(NAME_MAX),
});
