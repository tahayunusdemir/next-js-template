'use client';

import { ExternalLinkIcon, XIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { ChatParticipant } from '@/libs/Chat';
import { Link } from '@/libs/I18nNavigation';
import type { Relationship } from '@/libs/Social';
import { getInitials } from '@/utils/Helpers';

export function ParticipantDetails(props: {
  participant: ChatParticipant;
  relationship: Relationship;
  onClose: () => void;
}) {
  const t = useTranslations('DashboardMessagesPage');
  const name = props.participant.displayName ?? props.participant.handle;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto p-4">
      <div className="flex items-start gap-3">
        <Avatar size="lg" className="shrink-0">
          {props.participant.avatarUrl ? (
            <AvatarImage src={props.participant.avatarUrl} alt={name} />
          ) : null}
          <AvatarFallback className="bg-background">{getInitials(name)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="truncate leading-5 font-medium">{name}</div>
          <div className="truncate text-xs text-muted-foreground">@{props.participant.handle}</div>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t('close_profile')}
          onClick={props.onClose}
        >
          <XIcon />
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {props.relationship.isFollowing ? (
          <Badge variant="secondary">{t('relationship_following')}</Badge>
        ) : null}
        {props.relationship.isFollowedBy ? (
          <Badge variant="outline">{t('relationship_follows_you')}</Badge>
        ) : null}
        {!props.relationship.isFollowing && !props.relationship.isFollowedBy ? (
          <Badge variant="outline">{t('relationship_request')}</Badge>
        ) : null}
      </div>

      <Separator />

      <Link
        href={`/u/${props.participant.handle}`}
        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full')}
      >
        <ExternalLinkIcon />
        {t('view_full_profile')}
      </Link>
    </div>
  );
}
