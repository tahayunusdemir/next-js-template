'use client';

import { useTranslations } from 'next-intl';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AchievementGroupView } from '@/types/Achievements';
import { AchievementBadgeRow } from './achievement-badge-row';

// One group card: the path title, the "unlocked / total" tally, and the ladder of badge rows.
export function AchievementGroupCard(props: { group: AchievementGroupView }) {
  const t = useTranslations('DashboardAchievementsPage');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t(`${props.group.id}_title`)}</CardTitle>
        <CardAction className="text-sm font-medium text-muted-foreground tabular-nums">
          {t('progress', { unlocked: props.group.unlockedCount, total: props.group.total })}
        </CardAction>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2">
          {props.group.achievements.map((badge) => (
            <AchievementBadgeRow badge={badge} key={badge.id} secret={props.group.secret} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
