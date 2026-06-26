'use client';

import { SearchIcon, UserIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import * as React from 'react';
import type { CinePersonResult } from '@/app/[locale]/(auth)/dashboard/cinetest/actions';
import {
  popularCinePeople,
  searchCinePeople,
} from '@/app/[locale]/(auth)/dashboard/cinetest/actions';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { profileUrl } from '@/libs/Tmdb';
import type { PersonPick, PersonSearchQuestion } from '@/types/CineTest';

const DEBOUNCE_MS = 350;
const MIN_QUERY = 2;

function PersonAvatar(props: { profilePath: string | null; name: string }) {
  const avatarUrl = profileUrl(props.profilePath);

  if (!avatarUrl) {
    return (
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
        <UserIcon className="size-5 text-muted-foreground" />
      </span>
    );
  }

  return (
    <Image
      src={avatarUrl}
      alt={props.name}
      width={40}
      height={40}
      className="size-10 shrink-0 rounded-full object-cover"
    />
  );
}

// A selectable, photo-led people list shared by the typed search and the popular seed list.
function PeopleList(props: {
  people: CinePersonResult[];
  onSelect: (person: CinePersonResult) => void;
}) {
  return (
    <ul className="divide-y rounded-xl border">
      {props.people.map((person) => (
        <li key={person.id}>
          <button
            type="button"
            onClick={() => {
              props.onSelect(person);
            }}
            className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-muted"
          >
            <PersonAvatar profilePath={person.profilePath} name={person.name} />
            <span className="flex-1 text-sm font-medium">{person.name}</span>
            {person.department ? (
              <span className="text-xs text-muted-foreground">{person.department}</span>
            ) : null}
          </button>
        </li>
      ))}
    </ul>
  );
}

// TMDB typeahead for the favorite director / actor questions. `hideLegend` keeps the
// fieldset's accessible name while letting the film stage own the visible heading.
export function QuestionPersonSearch(props: {
  question: PersonSearchQuestion;
  value: PersonPick | undefined;
  onValue: (pick: PersonPick) => void;
  hideLegend?: boolean;
}) {
  const t = useTranslations('CineTest');
  const tPage = useTranslations('CineTestPage');
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<CinePersonResult[]>([]);
  const [popular, setPopular] = React.useState<CinePersonResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  // Monotonic id so a slow response can't overwrite the results of a newer query.
  const latestRequest = React.useRef(0);

  // Seed the picker with popular directors/actors so an untouched field isn't a blank box.
  // The cleanup flag drops a stale response if the role changes mid-flight.
  React.useEffect(() => {
    let active = true;

    async function loadPopular() {
      const response = await popularCinePeople({ role: props.question.role });

      if (active) {
        setPopular(response.ok ? response.people : []);
      }
    }

    void loadPopular();

    return () => {
      active = false;
    };
  }, [props.question.role]);

  async function loadPeople(term: string, requestId: number) {
    const response = await searchCinePeople({ query: term, role: props.question.role });

    if (requestId !== latestRequest.current) {
      return;
    }

    setResults(response.ok ? response.people : []);
    setFailed(!response.ok);
    setLoading(false);
  }

  function runSearch(next: string) {
    if (timer.current) {
      clearTimeout(timer.current);
    }

    const trimmed = next.trim();
    const requestId = (latestRequest.current += 1);

    if (trimmed.length < MIN_QUERY) {
      setResults([]);
      setLoading(false);
      setFailed(false);
      return;
    }

    setLoading(true);
    setFailed(false);
    timer.current = setTimeout(() => {
      void loadPeople(trimmed, requestId);
    }, DEBOUNCE_MS);
  }

  function select(person: CinePersonResult) {
    if (timer.current) {
      clearTimeout(timer.current);
    }

    // Invalidate any pending response so it can't reopen the closed list.
    latestRequest.current += 1;
    props.onValue({ personId: person.id, name: person.name, profilePath: person.profilePath });
    setQuery('');
    setResults([]);
    setLoading(false);
    setFailed(false);
  }

  const roleLabel =
    props.question.role === 'director'
      ? tPage('person_director_label')
      : tPage('person_actor_label');

  const popularLabel =
    props.question.role === 'director'
      ? tPage('person_popular_directors')
      : tPage('person_popular_actors');

  // Below the search threshold the field shows the popular seed list instead of a typed search.
  const searching = query.trim().length >= MIN_QUERY;

  return (
    <fieldset className="space-y-4">
      <legend
        className={cn(
          'font-heading text-lg font-medium text-balance',
          props.hideLegend && 'sr-only',
        )}
      >
        {t(`${props.question.id}_text`)}
      </legend>

      {props.value ? (
        <div className="flex items-center gap-3 rounded-xl border bg-background p-3 ring-1 ring-primary/40">
          <PersonAvatar profilePath={props.value.profilePath} name={props.value.name} />
          <div className="flex-1">
            <p className="text-sm font-medium">{props.value.name}</p>
            <p className="text-xs text-muted-foreground">{tPage('person_selected')}</p>
          </div>
        </div>
      ) : null}

      <div className="relative">
        <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          aria-label={roleLabel}
          placeholder={tPage('person_search_placeholder')}
          className="pl-9"
          onChange={(event) => {
            setQuery(event.target.value);
            runSearch(event.target.value);
          }}
        />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">{tPage('person_searching')}</p>
      ) : null}

      {!loading && failed ? (
        <p className="text-sm text-muted-foreground">{tPage('person_error')}</p>
      ) : null}

      {!loading && !failed && searching && results.length === 0 ? (
        <p className="text-sm text-muted-foreground">{tPage('person_no_results')}</p>
      ) : null}

      {searching && results.length ? <PeopleList people={results} onSelect={select} /> : null}

      {!searching && popular.length ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">{popularLabel}</p>
          <PeopleList people={popular} onSelect={select} />
        </div>
      ) : null}
    </fieldset>
  );
}
