import * as z from 'zod';

/** Maximum length of a feedback message, in characters. */
export const FEEDBACK_MAX = 2000;

/** Topics a dashboard feedback message can be filed under. */
export const FEEDBACK_SUBJECTS = ['general', 'bug', 'idea'] as const;

// Dashboard feedback payload. The submitter's email is taken from the Clerk session
// server-side, so only the subject and message are collected from the form.
export const FeedbackValidation = z.object({
  subject: z.enum(FEEDBACK_SUBJECTS),
  message: z.string().trim().min(1).max(FEEDBACK_MAX),
});
