import type { AsyncSink } from '@logtape/logtape';
import {
  configure,
  fromAsyncSink,
  getConsoleSink,
  getJsonLinesFormatter,
  getLogger,
} from '@logtape/logtape';
import { Env } from './Env';

// Best-effort log forwarding: a failed ingest must never crash the app or surface
// as an unhandled rejection, so network and non-OK responses are swallowed.
const betterStackSink: AsyncSink = async (record) => {
  try {
    await fetch(`https://${Env.NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN}`,
      },
      body: JSON.stringify(record),
    });
  } catch {
    // Ignore: logging must not take down the request.
  }
};

const canForwardToBetterStack =
  Boolean(Env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN) &&
  Boolean(Env.NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST);

await configure({
  sinks: {
    console: getConsoleSink({ formatter: getJsonLinesFormatter() }),
    betterStack: fromAsyncSink(betterStackSink),
  },
  loggers: [
    {
      category: ['logtape', 'meta'],
      sinks: ['console'],
      lowestLevel: 'warning',
    },
    {
      category: ['app'],
      sinks: canForwardToBetterStack ? ['console', 'betterStack'] : ['console'],
      lowestLevel: Env.NEXT_PUBLIC_LOGGING_LEVEL,
    },
  ],
});

export const logger = getLogger(['app']);
