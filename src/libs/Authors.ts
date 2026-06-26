// Blog authors reuse the real founding team. Names and roles are not stored here —
// they resolve from the existing `Team` i18n namespace via `teamKey`, keeping a single
// source of truth for people across the marketing site.
export const authors = {
  taha: { image: '/team/taha.png', teamKey: 'member_1' },
  kemal: { image: '/team/kemal.png', teamKey: 'member_2' },
  firat: { image: '/team/firat.png', teamKey: 'member_3' },
} as const;

export type AuthorKey = keyof typeof authors;
