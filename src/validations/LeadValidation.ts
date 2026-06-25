import * as z from 'zod';

export const NewsletterValidation = z.object({
  email: z.email(),
});

export const ContactValidation = z.object({
  name: z.string().min(1),
  email: z.email(),
  subject: z.string().min(1),
  message: z.string().min(1),
});
