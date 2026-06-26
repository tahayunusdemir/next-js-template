import * as z from 'zod';
import { CHAT_FILTERS } from '@/types/Chat';

/** Field limit, shared by the composer and the server. */
export const MESSAGE_BODY_MAX = 4000;

// Payload for sending a message into an existing conversation.
export const SendMessageValidation = z.object({
  conversationId: z.uuid(),
  body: z.string().trim().min(1).max(MESSAGE_BODY_MAX),
});

// Payload for opening (or reusing) a direct thread with another user.
export const StartConversationValidation = z.object({
  targetId: z.string().trim().min(1),
});

// A bare conversation id, for mark-read / archive actions.
export const ConversationIdValidation = z.uuid();

// Archive toggle for one of the signed-in user's threads.
export const SetArchivedValidation = z.object({
  conversationId: z.uuid(),
  archived: z.boolean(),
});

// Inbox filter from the list search params, defaulted so a bad value never throws.
export const ChatFilterValidation = z.enum(CHAT_FILTERS).default('all');
