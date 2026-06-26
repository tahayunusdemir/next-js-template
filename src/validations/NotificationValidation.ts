import * as z from 'zod';

// A bare notification id, for the mark-one-read action.
export const NotificationIdValidation = z.uuid();
