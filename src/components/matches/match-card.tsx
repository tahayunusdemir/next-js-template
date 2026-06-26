'use client';

import { HeartHandshakeIcon, MessageCircleIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { toast } from 'sonner';
import { respondToMatchAction } from '@/app/[locale]/(auth)/dashboard/matches/actions';
import { MatchAxes } from '@/components/matches/match-axes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { countryName } from '@/lib/countries';
import { Link, useRouter } from '@/libs/I18nNavigation';
import type { MatchCard as MatchCardModel } from '@/types/CineMatch';
import { getInitials } from '@/utils/Helpers';

// One match, oriented to the viewer: similarity score, the redacted other party (display
// name + CineType + city only until connected), the axis breakdown, shared films, and the
// consent / chat controls.
export function MatchCard(props: { match: MatchCardModel; locale: string }) {
  const t = useTranslations('DashboardMatchesPage');
  const tc = useTranslations('CineMatch');
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const { match } = props;

  async function respond(decision: 'accept' | 'decline') {
    setPending(true);
    const result = await respondToMatchAction({ matchId: match.id, decision });
    setPending(false);

    if (!result.ok) {
      toast.error(t('action_error'));
      return;
    }

    if (decision === 'decline') {
      toast(t('match_declined_toast'));
    } else if (result.connected) {
      toast.success(t('match_connected_toast'));
    } else {
      toast(t('match_accepted_toast'));
    }

    router.refresh();
  }

  const connected = match.status === 'connected';
  const name = match.other.displayName ?? t('redacted_name');
  const location = match.other.country ? countryName(match.other.country, props.locale) : null;
  const meta = [match.other.cineTypeCode, location].filter(Boolean).join(' · ');

  let actions: React.ReactNode;

  if (connected) {
    actions = (
      <Button
        size="sm"
        render={
          <Link
            href={
              match.conversationId
                ? `/dashboard/messages?c=${match.conversationId}`
                : '/dashboard/messages'
            }
          />
        }
      >
        <MessageCircleIcon />
        {t('open_chat')}
      </Button>
    );
  } else if (match.myConsent === 'accepted') {
    actions = <span className="text-xs text-muted-foreground">{t('awaiting_them')}</span>;
  } else {
    actions = (
      <>
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() => void respond('decline')}
        >
          {t('consent_decline')}
        </Button>
        <Button size="sm" disabled={pending} onClick={() => void respond('accept')}>
          {t('consent_accept')}
        </Button>
      </>
    );
  }

  return (
    <article className="flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-10">
            {connected && match.other.avatarUrl ? (
              <AvatarImage src={match.other.avatarUrl} alt={name} />
            ) : null}
            <AvatarFallback>
              {connected ? getInitials(name) : <HeartHandshakeIcon className="size-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{name}</p>
            {meta ? <p className="truncate text-xs text-muted-foreground">{meta}</p> : null}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-2xl leading-none font-semibold tabular-nums">{match.score}%</div>
          <Badge variant={match.isFallback ? 'outline' : 'secondary'} className="mt-1.5">
            {match.isFallback ? tc('fallback') : tc('above_threshold')}
          </Badge>
        </div>
      </header>

      <MatchAxes axes={match.axes} />

      <p className="text-xs text-muted-foreground">
        {tc('shared_watched', { count: match.sharedWatched })}
      </p>

      <footer className="flex items-center justify-between gap-2">
        {connected ? (
          <Badge variant="outline" className="text-green-600">
            {t('connected_badge')}
          </Badge>
        ) : (
          <Link
            href={`/dashboard/matches/${match.id}`}
            className="text-xs text-muted-foreground hover:underline"
          >
            {t('view_breakdown')}
          </Link>
        )}
        <div className="flex items-center gap-2">{actions}</div>
      </footer>
    </article>
  );
}
