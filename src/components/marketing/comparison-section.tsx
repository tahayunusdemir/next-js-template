import { CheckIcon, MinusIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Section, SectionHeading } from '@/components/marketing/section';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

type Cell = boolean | string;

function CellValue(props: { value: Cell }) {
  if (typeof props.value === 'string') {
    return <span className="text-sm">{props.value}</span>;
  }
  if (props.value) {
    return <CheckIcon className="mx-auto size-4 text-foreground" aria-hidden />;
  }
  return <MinusIcon className="mx-auto size-4 text-muted-foreground/50" aria-hidden />;
}

function PlanCell(props: { value: Cell; highlight?: boolean }) {
  return (
    <TableCell className={cn('text-center', props.highlight && 'bg-muted/40')}>
      <CellValue value={props.value} />
    </TableCell>
  );
}

export function ComparisonSection() {
  const t = useTranslations('Comparison');

  const rows: { id: string; label: string; values: [Cell, Cell, Cell, Cell] }[] = [
    { id: 'discover', label: t('row_discover'), values: [true, true, true, true] },
    {
      id: 'match',
      label: t('row_match'),
      values: [t('value_weekly'), t('value_daily'), t('value_unlimited'), t('value_unlimited')],
    },
    { id: 'see_who_liked', label: t('row_see_who_liked'), values: [false, true, true, true] },
    { id: 'advanced_filters', label: t('row_advanced_filters'), values: [false, true, true, true] },
    { id: 'ad_free', label: t('row_ad_free'), values: [false, true, true, true] },
    {
      id: 'priority_matching',
      label: t('row_priority_matching'),
      values: [false, true, true, true],
    },
    { id: 'private_groups', label: t('row_private_groups'), values: [false, false, true, true] },
    { id: 'movie_night', label: t('row_movie_night'), values: [false, false, true, true] },
    { id: 'profile_boost', label: t('row_profile_boost'), values: [false, false, true, true] },
    { id: 'ai', label: t('row_ai'), values: [false, false, true, true] },
    { id: 'early_access', label: t('row_early_access'), values: [false, false, true, true] },
    { id: 'exclusive', label: t('row_exclusive'), values: [false, false, false, true] },
    { id: 'events', label: t('row_events'), values: [false, false, false, true] },
    { id: 'elite_badge', label: t('row_elite_badge'), values: [false, false, false, true] },
    { id: 'support', label: t('row_support'), values: [false, false, false, true] },
    { id: 'invitations', label: t('row_invitations'), values: [false, false, false, true] },
  ];

  return (
    <Section id="compare">
      <SectionHeading badge={t('badge')} title={t('title')} subtitle={t('subtitle')} />
      <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-xl border ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[40%]">{t('col_feature')}</TableHead>
              <TableHead className="text-center">{t('col_free')}</TableHead>
              <TableHead className="bg-muted/40 text-center text-foreground">
                {t('col_plus')}
              </TableHead>
              <TableHead className="text-center">{t('col_pro')}</TableHead>
              <TableHead className="text-center">{t('col_elite')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.label}</TableCell>
                <PlanCell value={row.values[0]} />
                <PlanCell value={row.values[1]} highlight />
                <PlanCell value={row.values[2]} />
                <PlanCell value={row.values[3]} />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Section>
  );
}
