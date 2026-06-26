'use client';

import * as React from 'react';

// Where the community UI is rendered. The public marketing feed is read-only (`interactive`
// false): visitors can browse and share, but voting, commenting, posting, editing, and
// deleting are gated to the dashboard. Each feed roots its links at `basePath` so the same
// components serve `/community` and `/dashboard/community`.
type CommunityMode = {
  interactive: boolean;
  basePath: string;
};

const DEFAULT_MODE: CommunityMode = { interactive: false, basePath: '/community' };

const CommunityModeContext = React.createContext<CommunityMode>(DEFAULT_MODE);

// Reads the active community mode; falls back to the read-only public defaults when no
// provider is mounted, so the marketing feed needs no wrapper.
export function useCommunityMode() {
  return React.useContext(CommunityModeContext);
}

export function CommunityModeProvider(props: {
  interactive?: boolean;
  basePath?: string;
  children: React.ReactNode;
}) {
  const value: CommunityMode = {
    interactive: props.interactive ?? DEFAULT_MODE.interactive,
    basePath: props.basePath ?? DEFAULT_MODE.basePath,
  };

  return (
    <CommunityModeContext.Provider value={value}>{props.children}</CommunityModeContext.Provider>
  );
}
