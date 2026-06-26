'use client';

import { BanIcon, EllipsisVerticalIcon, UserCheckIcon, UserPlusIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { toast } from 'sonner';
import { setRelationship } from '@/app/[locale]/(profile)/u/[handle]/actions';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from '@/libs/I18nNavigation';
import type { FollowAction } from '@/validations/FollowValidation';

type FollowState = { isFollowing: boolean; isBlocked: boolean };

type FollowButtonProps = {
  targetId: string;
  initial: FollowState;
  size?: 'default' | 'sm';
  // Hides the block menu for anonymous viewers; the follow button still prompts sign-in.
  signedIn?: boolean;
  // The target has blocked the viewer: following would silently no-op server-side, so disable it.
  blockedByTarget?: boolean;
};

export function FollowButton(props: FollowButtonProps) {
  const t = useTranslations('ProfilePage');
  const router = useRouter();
  const [state, setState] = React.useState(props.initial);
  const [pending, startTransition] = React.useTransition();
  const size = props.size ?? 'default';
  const signedIn = props.signedIn ?? true;

  function run(action: FollowAction, next: FollowState) {
    const previous = state;
    setState(next);

    startTransition(async () => {
      const result = await setRelationship({ targetId: props.targetId, action });

      if (!result.ok) {
        setState(previous);

        if (result.reason === 'auth') {
          toast.error(t('sign_in_required'));
          router.push('/sign-in');
        } else {
          toast.error(t('action_error'));
        }

        return;
      }

      router.refresh();
    });
  }

  if (state.isBlocked) {
    return (
      <Button
        variant="outline"
        size={size}
        disabled={pending}
        onClick={() => {
          run('unblock', { isFollowing: false, isBlocked: false });
        }}
      >
        {t('unblock')}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant={state.isFollowing ? 'outline' : 'default'}
        size={size}
        disabled={pending || props.blockedByTarget}
        onClick={() => {
          run(state.isFollowing ? 'unfollow' : 'follow', {
            ...state,
            isFollowing: !state.isFollowing,
          });
        }}
      >
        {state.isFollowing ? <UserCheckIcon /> : <UserPlusIcon />}
        {state.isFollowing ? t('following') : t('follow')}
      </Button>

      {signedIn ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label={t('more_actions')}
                disabled={pending}
              />
            }
          >
            <EllipsisVerticalIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                run('block', { isFollowing: false, isBlocked: true });
              }}
            >
              <BanIcon />
              {t('block')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
}
