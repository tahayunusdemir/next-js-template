import * as z from 'zod';

/** RFC 5321 caps an email address at 254 characters. */
const EMAIL_MAX = 254;
/** Field limits for the contact form, shared by the form and the server. */
const CONTACT_SUBJECT_MAX = 200;
export const CONTACT_MESSAGE_MAX = 2000;

export const NewsletterValidation = z.object({
  email: z.email().max(EMAIL_MAX),
});

export const ContactValidation = z.object({
  email: z.email().max(EMAIL_MAX),
  subject: z.string().trim().min(1).max(CONTACT_SUBJECT_MAX),
  message: z.string().trim().min(1).max(CONTACT_MESSAGE_MAX),
});
