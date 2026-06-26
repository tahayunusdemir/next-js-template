'use client';

import { ArrowBigDownIcon, ArrowBigUpIcon } from 'lucide-react';
import * as React from 'react';
import { voteAction } from '@/app/[locale]/(marketing)/community/actions';
import { useCommunityAction } from '@/components/community/use-community-action';
import { cn } from '@/lib/utils';
import type { VoteValue } from '@/libs/Community';
import type { CommunityTarget } from '@/types/Community';

type VoteButtonsProps = {
  targetType: CommunityTarget;
  targetId: string;
  score: number;
  viewerVote: VoteValue;
  orientation?: 'vertical' | 'horizontal';
};

// Up/down vote control with an optimistic score. Toggling the active arrow clears the vote.
// Anonymous users are routed to sign-in; failures roll the optimistic state back.
export function VoteButtons(props: VoteButtonsProps) {
  const { t, guard, onFailure } = useCommunityAction();
  const [vote, setVote] = React.useState<VoteValue>(props.viewerVote);
  const [pending, startTransition] = React.useTransition();

  // Score without the viewer's own vote, so the optimistic total is always base + vote.
  const base = props.score - props.viewerVote;
  const score = base + vote;
  const vertical = (props.orientation ?? 'vertical') === 'vertical';

  function cast(value: VoteValue) {
    if (!guard()) {
      return;
    }

    const next: VoteValue = vote === value ? 0 : value;
    const previous = vote;
    setVote(next);

    startTransition(async () => {
      const result = await voteAction({
        targetType: props.targetType,
        targetId: props.targetId,
        value: next,
      });

      if (!result.ok) {
        setVote(previous);
        onFailure(result.reason);
      }
    });
  }

  return (
    <div className={cn('flex items-center gap-1', vertical ? 'flex-col' : 'flex-row')}>
      <button
        type="button"
        aria-label={t('upvote')}
        aria-pressed={vote === 1}
        disabled={pending}
        onClick={() => {
          cast(1);
        }}
        className={cn(
          'rounded p-1 text-muted-foreground transition-colors hover:text-foreground',
          vote === 1 && 'text-primary',
        )}
      >
        <ArrowBigUpIcon className="size-5" />
      </button>

      <span
        aria-live="polite"
        className={cn(
          'text-xs font-medium tabular-nums',
          vote === 1 && 'text-primary',
          vote === -1 && 'text-destructive',
        )}
      >
        {score}
      </span>

      <button
        type="button"
        aria-label={t('downvote')}
        aria-pressed={vote === -1}
        disabled={pending}
        onClick={() => {
          cast(-1);
        }}
        className={cn(
          'rounded p-1 text-muted-foreground transition-colors hover:text-foreground',
          vote === -1 && 'text-destructive',
        )}
      >
        <ArrowBigDownIcon className="size-5" />
      </button>
    </div>
  );
}
