import type { CineAspect, CineRole, CineSectionKey, CineType } from '@/types/CineType';

// Static tables for the CineType directory — the cinema-native personality model in
// docs/cinepersona-docs/cinetype/cinetype-framework.md. Four disposition axes
// (Gaze·Eye·Pulse·Compass) assemble the 4-letter code; the middle two letters group
// the 16 types into four roles. Display copy is keyed off these slugs/letters and
// resolved via next-intl.

export const cineRoles: CineRole[] = [
  { slug: 'dreamers', filter: '_VH_' },
  { slug: 'stylists', filter: '_VM_' },
  { slug: 'empaths', filter: '_RH_' },
  { slug: 'auteurs', filter: '_RM_' },
];

export const cineAspects: CineAspect[] = [
  { kind: 'gaze', poles: [{ letter: 'S' }, { letter: 'C' }] },
  { kind: 'eye', poles: [{ letter: 'V' }, { letter: 'R' }] },
  { kind: 'pulse', poles: [{ letter: 'H' }, { letter: 'M' }] },
  { kind: 'compass', poles: [{ letter: 'A' }, { letter: 'F' }] },
];

/** Long-form detail-page sections, in display order. */
export const cineSectionKeys: CineSectionKey[] = [
  'introduction',
  'how_they_watch',
  'what_they_love',
  'blind_spots',
  'with_others',
  'growth',
  'conclusion',
];

export const cineTypes: CineType[] = [
  // Dreamers (_VH_)
  {
    code: 'SVHA',
    slug: 'nostalgist',
    roleSlug: 'dreamers',
    letters: { gaze: 'S', eye: 'V', pulse: 'H', compass: 'A' },
  },
  {
    code: 'SVHF',
    slug: 'daydreamer',
    roleSlug: 'dreamers',
    letters: { gaze: 'S', eye: 'V', pulse: 'H', compass: 'F' },
  },
  {
    code: 'CVHA',
    slug: 'superfan',
    roleSlug: 'dreamers',
    letters: { gaze: 'C', eye: 'V', pulse: 'H', compass: 'A' },
  },
  {
    code: 'CVHF',
    slug: 'thrillseeker',
    roleSlug: 'dreamers',
    letters: { gaze: 'C', eye: 'V', pulse: 'H', compass: 'F' },
  },
  // Stylists (_VM_)
  {
    code: 'SVMA',
    slug: 'connoisseur',
    roleSlug: 'stylists',
    letters: { gaze: 'S', eye: 'V', pulse: 'M', compass: 'A' },
  },
  {
    code: 'SVMF',
    slug: 'prospector',
    roleSlug: 'stylists',
    letters: { gaze: 'S', eye: 'V', pulse: 'M', compass: 'F' },
  },
  {
    code: 'CVMA',
    slug: 'aficionado',
    roleSlug: 'stylists',
    letters: { gaze: 'C', eye: 'V', pulse: 'M', compass: 'A' },
  },
  {
    code: 'CVMF',
    slug: 'tastemaker',
    roleSlug: 'stylists',
    letters: { gaze: 'C', eye: 'V', pulse: 'M', compass: 'F' },
  },
  // Empaths (_RH_)
  {
    code: 'SRHA',
    slug: 'romantic',
    roleSlug: 'empaths',
    letters: { gaze: 'S', eye: 'R', pulse: 'H', compass: 'A' },
  },
  {
    code: 'SRHF',
    slug: 'wanderer',
    roleSlug: 'empaths',
    letters: { gaze: 'S', eye: 'R', pulse: 'H', compass: 'F' },
  },
  {
    code: 'CRHA',
    slug: 'companion',
    roleSlug: 'empaths',
    letters: { gaze: 'C', eye: 'R', pulse: 'H', compass: 'A' },
  },
  {
    code: 'CRHF',
    slug: 'evangelist',
    roleSlug: 'empaths',
    letters: { gaze: 'C', eye: 'R', pulse: 'H', compass: 'F' },
  },
  // Auteurs (_RM_)
  {
    code: 'SRMA',
    slug: 'archivist',
    roleSlug: 'auteurs',
    letters: { gaze: 'S', eye: 'R', pulse: 'M', compass: 'A' },
  },
  {
    code: 'SRMF',
    slug: 'theorist',
    roleSlug: 'auteurs',
    letters: { gaze: 'S', eye: 'R', pulse: 'M', compass: 'F' },
  },
  {
    code: 'CRMA',
    slug: 'critic',
    roleSlug: 'auteurs',
    letters: { gaze: 'C', eye: 'R', pulse: 'M', compass: 'A' },
  },
  {
    code: 'CRMF',
    slug: 'programmer',
    roleSlug: 'auteurs',
    letters: { gaze: 'C', eye: 'R', pulse: 'M', compass: 'F' },
  },
];

// Literal position tuples keep the generated i18n keys (e.g. `${slug}_strength_3_title`)
// within a finite union the strictly-typed `t()` accepts.
export const cineTraitPositions = [1, 2, 3, 4, 5, 6] as const;
export const cinePersonPositions = [1, 2, 3, 4] as const;

export function getCineTypeBySlug(slug: string): CineType | undefined {
  return cineTypes.find((type) => type.slug === slug);
}

export function getCineTypesByRole(roleSlug: string): CineType[] {
  return cineTypes.filter((type) => type.roleSlug === roleSlug);
}

// Previous/next types in directory order, wrapping around the ends.
export function getAdjacentCineTypes(slug: string): { prev: CineType; next: CineType } | undefined {
  const index = cineTypes.findIndex((type) => type.slug === slug);

  if (index === -1) {
    return undefined;
  }

  const prev = cineTypes.at((index - 1 + cineTypes.length) % cineTypes.length);
  const next = cineTypes.at((index + 1) % cineTypes.length);

  if (!prev || !next) {
    return undefined;
  }

  return { prev, next };
}
