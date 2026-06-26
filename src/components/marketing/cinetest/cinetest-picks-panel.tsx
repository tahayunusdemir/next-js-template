'use client';

import { FilmIcon, UserIcon } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export type PicksPanelEntry = {
  id: string;
  label: string;
  current: boolean;
  posters: (string | null)[];
  person?: { name: string; avatar: string | null };
};

function Thumb(props: { src: string | null; alt: string }) {
  return (
    <span className="relative block h-12 w-8 shrink-0 overflow-hidden rounded bg-muted ring-1 ring-border">
      {props.src ? (
        <Image src={props.src} alt={props.alt} fill sizes="32px" className="object-cover" />
      ) : (
        <span className="flex h-full items-center justify-center text-muted-foreground">
          <FilmIcon className="size-3.5" />
        </span>
      )}
    </span>
  );
}

function PersonAvatar(props: { name: string; avatar: string | null }) {
  if (!props.avatar) {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <UserIcon className="size-4" />
      </span>
    );
  }

  return (
    <Image
      src={props.avatar}
      alt={props.name}
      width={32}
      height={32}
      className="size-8 shrink-0 rounded-full object-cover"
    />
  );
}

function EntryMeta(props: { entry: PicksPanelEntry; emptyLabel: string }) {
  if (props.entry.person) {
    return (
      <span className="truncate text-xs text-muted-foreground">{props.entry.person.name}</span>
    );
  }

  if (props.entry.posters.length === 0) {
    return <span className="text-xs text-muted-foreground">{props.emptyLabel}</span>;
  }

  return null;
}

function EntryVisual(props: { entry: PicksPanelEntry }) {
  if (props.entry.person) {
    return <PersonAvatar name={props.entry.person.name} avatar={props.entry.person.avatar} />;
  }

  if (props.entry.posters.length === 0) {
    return null;
  }

  return (
    <span className="flex shrink-0 gap-1">
      {props.entry.posters.map((poster, index) => (
        <Thumb key={index} src={poster} alt={props.entry.label} />
      ))}
    </span>
  );
}

// The floating "your picks" panel: one row per film question with its selected poster(s) or
// favourite person, the active question highlighted, click-to-jump for review and edits.
export function CineTestPicksPanel(props: {
  title: string;
  emptyLabel: string;
  entries: PicksPanelEntry[];
  onJump: (index: number) => void;
}) {
  return (
    <aside className="rounded-2xl border bg-card p-4 ring-1 ring-foreground/10 lg:sticky lg:top-24">
      <h2 className="text-sm font-medium">{props.title}</h2>
      <ol className="mt-3 flex flex-col gap-1.5">
        {props.entries.map((entry, index) => (
          <li key={entry.id}>
            <button
              type="button"
              aria-current={entry.current}
              onClick={() => {
                props.onJump(index);
              }}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg border p-2 text-left transition-colors',
                entry.current
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-transparent hover:bg-muted',
              )}
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate text-xs font-medium">{entry.label}</span>
                <EntryMeta entry={entry} emptyLabel={props.emptyLabel} />
              </div>

              <EntryVisual entry={entry} />
            </button>
          </li>
        ))}
      </ol>
    </aside>
  );
}
