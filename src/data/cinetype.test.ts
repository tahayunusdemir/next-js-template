import { describe, expect, it } from 'vitest';
import {
  cineAspects,
  cineRoles,
  cineTypes,
  getAdjacentCineTypes,
  getCineTypeBySlug,
  getCineTypesByRole,
} from './cinetype';

describe('type table', () => {
  it('contains all 16 types with unique codes and slugs', () => {
    expect(cineTypes).toHaveLength(16);
    expect(new Set(cineTypes.map((type) => type.code)).size).toBe(16);
    expect(new Set(cineTypes.map((type) => type.slug)).size).toBe(16);
  });

  it('derives each code from its four letters', () => {
    for (const type of cineTypes) {
      const code = type.letters.gaze + type.letters.eye + type.letters.pulse + type.letters.compass;

      expect(code).toBe(type.code);
    }
  });
});

describe('lookup by slug', () => {
  it('resolves a known slug', () => {
    expect(getCineTypeBySlug('thrillseeker')?.code).toBe('CVHF');
  });

  it('returns undefined for an unknown slug', () => {
    expect(getCineTypeBySlug('missing')).toBeUndefined();
  });
});

describe('grouping by role', () => {
  it('groups four types per role', () => {
    expect(getCineTypesByRole('dreamers')).toHaveLength(4);
  });
});

describe('adjacent navigation', () => {
  it('wraps around the ends of the list', () => {
    expect(getAdjacentCineTypes('nostalgist')?.prev.code).toBe('CRMF');
    expect(getAdjacentCineTypes('programmer')?.next.code).toBe('SVHA');
  });

  it('returns undefined for an unknown slug', () => {
    expect(getAdjacentCineTypes('missing')).toBeUndefined();
  });
});

describe('code space', () => {
  it('covers the full cartesian product of the four axis pairs', () => {
    const expected = new Set<string>();

    for (const gaze of ['S', 'C']) {
      for (const eye of ['V', 'R']) {
        for (const pulse of ['H', 'M']) {
          for (const compass of ['A', 'F']) {
            expected.add(`${gaze}${eye}${pulse}${compass}`);
          }
        }
      }
    }

    expect(new Set(cineTypes.map((type) => type.code))).toStrictEqual(expected);
  });

  it('covers the type-code letters with exactly the aspect poles', () => {
    // Type codes are four ASCII letters, so spreading the string is safe.
    // oxlint-disable-next-line typescript/no-misused-spread
    const codeLetters = new Set(cineTypes.flatMap((type) => [...type.code]));
    const poleLetters = new Set(
      cineAspects.flatMap((aspect) => aspect.poles.map((pole) => pole.letter)),
    );

    expect(poleLetters).toStrictEqual(codeLetters);
  });
});

describe('role consistency', () => {
  it('matches each type to the eye and pulse letters of its role', () => {
    for (const type of cineTypes) {
      const role = cineRoles.find((candidate) => candidate.slug === type.roleSlug);

      // The role filter is "_<eye><pulse>_", e.g. "_VH_" for Dreamers.
      expect(role?.filter).toBe(`_${type.letters.eye}${type.letters.pulse}_`);
    }
  });

  it('assigns all sixteen types across the four defined roles', () => {
    expect(cineRoles).toHaveLength(4);

    for (const role of cineRoles) {
      expect(getCineTypesByRole(role.slug)).toHaveLength(4);
    }

    expect(new Set(cineTypes.map((type) => type.roleSlug))).toStrictEqual(
      new Set(cineRoles.map((role) => role.slug)),
    );
  });
});
