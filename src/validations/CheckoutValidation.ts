import * as z from 'zod';

/** RFC 5321 caps an email address at 254 characters. */
const EMAIL_MAX = 254;
/** Maximum length of the billing name, in characters. */
const CHECKOUT_NAME_MAX = 100;

export const CheckoutValidation = z.object({
  plan: z.enum(['plus', 'pro', 'elite']),
  billing: z.enum(['monthly', 'annual']),
  email: z.email().max(EMAIL_MAX),
  name: z.string().trim().min(1).max(CHECKOUT_NAME_MAX),
});
