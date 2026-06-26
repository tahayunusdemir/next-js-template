// Resolves the name shown for a profile: the display name when set, else the @handle.
export function profileDisplayName(props: { displayName?: string | null; handle: string }) {
  return props.displayName?.trim() ? props.displayName : `@${props.handle}`;
}

// Strips a leading @, trims, then takes the first two letters as uppercase avatar initials.
export function initialsOf(name: string) {
  return name.replace(/^@/u, '').trim().slice(0, 2).toUpperCase() || 'U';
}
