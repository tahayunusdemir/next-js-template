import type {
  CinePage,
  CineTestAnswer,
  CineTestAnswers,
  CineTestQuestionId,
} from '@/types/CineTest';

// A tiny localStorage-backed store for the in-progress test. Read via
// useSyncExternalStore so server/first-client render uses the default snapshot
// (no hydration mismatch) and the saved state is picked up right after mount —
// all without a useEffect. Bump STORAGE_KEY's version when the question set changes.
//
// `completedAt`/`lastResultId` outlive a finished test (they survive completeTest) so the
// landing can mirror the once-a-month cooldown and link back to the last result.

const STORAGE_KEY = 'cinetest:v4';
const DEFAULT_STATE: CineTestState = { answers: {}, page: 1 };

export type CineTestState = {
  answers: CineTestAnswers;
  page: CinePage;
  completedAt?: number;
  lastResultId?: string;
};

let state: CineTestState = DEFAULT_STATE;
let hydrated = false;
const listeners = new Set<() => void>();

function isStoredState(value: unknown): value is Partial<CineTestState> {
  return typeof value === 'object' && value !== null;
}

function readStorage(): CineTestState {
  if (typeof window === 'undefined') {
    return DEFAULT_STATE;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return DEFAULT_STATE;
    }

    const parsed: unknown = JSON.parse(raw);

    if (isStoredState(parsed)) {
      return {
        answers: parsed.answers ?? {},
        page: parsed.page ?? 1,
        completedAt: parsed.completedAt,
        lastResultId: parsed.lastResultId,
      };
    }

    return DEFAULT_STATE;
  } catch {
    // Corrupt or unavailable storage falls back to a fresh test.
    return DEFAULT_STATE;
  }
}

function writeStorage() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage may be full or blocked; the test still works in-memory.
  }
}

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribe(listener: () => void) {
  if (!hydrated) {
    state = readStorage();
    hydrated = true;
  }

  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot() {
  return state;
}

export function getServerSnapshot() {
  return DEFAULT_STATE;
}

export function setAnswer(id: CineTestQuestionId, answer: CineTestAnswer) {
  state = { ...state, answers: { ...state.answers, [id]: answer } };
  writeStorage();
  emit();
}

export function setPage(page: CinePage) {
  state = { ...state, page };
  writeStorage();
  emit();
}

/**
 * Marks the test finished: clears the in-progress answers but keeps the completion stamp
 * and result id so the landing can enforce the cooldown and link back to the last result.
 * @param resultId - The id of the stored result this completion produced.
 */
export function completeTest(resultId: string) {
  state = { answers: {}, page: 1, completedAt: Date.now(), lastResultId: resultId };
  writeStorage();
  emit();
}
