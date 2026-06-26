// Static content model for the public CineType personality directory — a cinema-
// native personality system (see docs/cinepersona-docs/cinetype/cinetype-framework.md).
// Four disposition axes assemble a 4-letter code; the two middle letters group the 16
// types into four roles. All display copy lives in next-intl; this layer holds
// structure and stable keys only.

type CineRoleSlug = 'dreamers' | 'stylists' | 'empaths' | 'auteurs';

// Literal union of all 16 slugs. Keeping it literal (not `string`) lets the
// strictly-typed next-intl `t()` accept keys built from a slug, e.g. `${slug}_name`.
export type CineTypeSlug =
  | 'nostalgist'
  | 'daydreamer'
  | 'superfan'
  | 'thrillseeker'
  | 'connoisseur'
  | 'prospector'
  | 'aficionado'
  | 'tastemaker'
  | 'romantic'
  | 'wanderer'
  | 'companion'
  | 'evangelist'
  | 'archivist'
  | 'theorist'
  | 'critic'
  | 'programmer';

type CineAspectKind = 'gaze' | 'eye' | 'pulse' | 'compass';

type GazeLetter = 'S' | 'C';
type EyeLetter = 'V' | 'R';
type PulseLetter = 'H' | 'M';
type CompassLetter = 'A' | 'F';

/** The long-form sections rendered on a type's detail page, in display order. */
export type CineSectionKey =
  | 'introduction'
  | 'how_they_watch'
  | 'what_they_love'
  | 'blind_spots'
  | 'with_others'
  | 'growth'
  | 'conclusion';

export type CineRole = {
  slug: CineRoleSlug;
  /** Trait pattern over the middle two (Eye·Pulse) letters, e.g. "_VH_". */
  filter: string;
};

type CinePole = {
  letter: GazeLetter | EyeLetter | PulseLetter | CompassLetter;
};

export type CineAspect = {
  kind: CineAspectKind;
  /** The two poles, in display order (pole 1 = S/V/H/A, pole 2 = C/R/M/F). */
  poles: [CinePole, CinePole];
};

type CineTypeLetters = {
  gaze: GazeLetter;
  eye: EyeLetter;
  pulse: PulseLetter;
  compass: CompassLetter;
};

export type CineType = {
  /** Four-letter code, in Gaze·Eye·Pulse·Compass order, e.g. "CVHF". */
  code: string;
  /** URL slug derived from the name, e.g. "thrillseeker". */
  slug: CineTypeSlug;
  roleSlug: CineRoleSlug;
  letters: CineTypeLetters;
};
