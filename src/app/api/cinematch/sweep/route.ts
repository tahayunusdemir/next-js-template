import { NextResponse } from 'next/server';
import { sweepMatchRequests } from '@/libs/CineMatch';
import { Env } from '@/libs/Env';

// POST /api/cinematch/sweep — re-evaluates every searching request, fulfilling any that now
// clear the threshold and promoting fallbacks past the 7-day horizon. Meant for a scheduler
// (e.g. a Vercel cron or Checkly job) calling with `Authorization: Bearer <CINEMATCH_CRON_SECRET>`.
// Disabled (404) when no secret is configured, so it never runs open in local/dev.
export async function POST(request: Request) {
  const secret = Env.CINEMATCH_CRON_SECRET;

  if (!secret) {
    return new NextResponse(null, { status: 404 });
  }

  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new NextResponse(null, { status: 401 });
  }

  const result = await sweepMatchRequests();

  return NextResponse.json(result);
}
