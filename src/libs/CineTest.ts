import { desc, eq } from 'drizzle-orm';
import { cinetestResultSchema } from '@/models/Schema';
import type { CineAnswerMap, CineTestResult } from '@/types/CineTest';
import { db } from './DB';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;

/**
 * Persists a completed CineTest. Anonymous results pass `userId: null`.
 * @param props - The owner (or null), the raw answers, and the scored result.
 * @returns The stored result row.
 */
export async function createCineTestResult(props: {
  userId: string | null;
  answers: CineAnswerMap;
  result: CineTestResult;
}) {
  const [row] = await db
    .insert(cinetestResultSchema)
    .values({
      userId: props.userId,
      cineType: props.result.cineType,
      axisScores: props.result.vector,
      answers: props.answers,
      filmPicks: props.result.filmPicks,
      descriptor: props.result.descriptor,
    })
    .returning();

  return row;
}

/**
 * Loads a stored CineTest result by id.
 * @param id - The result uuid.
 * @returns The result row, or undefined when the id is malformed or unknown.
 */
export async function getCineTestResult(id: string) {
  const rows = UUID_PATTERN.test(id)
    ? await db.select().from(cinetestResultSchema).where(eq(cinetestResultSchema.id, id)).limit(1)
    : [];

  return rows[0];
}

/**
 * Loads a user's most recent CineTest result. Powers the profile picks section and the
 * once-a-month cooldown check.
 * @param userId - The Clerk user id (matches profile.id).
 * @returns The latest result row, or undefined when the user has never finished a test.
 */
export async function getLatestCineTestResultForUser(userId: string) {
  const [row] = await db
    .select()
    .from(cinetestResultSchema)
    .where(eq(cinetestResultSchema.userId, userId))
    .orderBy(desc(cinetestResultSchema.createdAt))
    .limit(1);

  return row;
}
