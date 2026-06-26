import * as z from 'zod';

const MATCH_DECISIONS = ['accept', 'decline'] as const;

// Server action payload for responding to a match offer: accept to opt in, decline to close.
export const MatchResponseValidation = z.object({
  matchId: z.uuid(),
  decision: z.enum(MATCH_DECISIONS),
});
