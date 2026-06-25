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

  const rows: { label: string; starter: Cell; pro: Cell; business: Cell }[] = [
    {
      label: t('row_workflows'),
      starter: '3',
      pro: t('value_unlimited'),
      business: t('value_unlimited'),
    },
    { label: t('row_runs'), starter: '1K', pro: '50K', business: t('value_unlimited') },
    {
      label: t('row_analytics'),
      starter: t('value_basic'),
      pro: t('value_advanced'),
      business: t('value_advanced'),
    },
    { label: t('row_roles'), starter: false, pro: true, business: true },
    { label: t('row_support'), starter: false, pro: true, business: true },
    { label: t('row_sso'), starter: false, pro: false, business: true },
    { label: t('row_audit'), starter: false, pro: false, business: true },
  ];

  return (
    <Section id="compare">
      <SectionHeading badge={t('badge')} title={t('title')} subtitle={t('subtitle')} />
      <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-xl border ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[40%]">{t('col_feature')}</TableHead>
              <TableHead className="text-center">{t('col_starter')}</TableHead>
              <TableHead className="bg-muted/40 text-center text-foreground">
                {t('col_pro')}
              </TableHead>
              <TableHead className="text-center">{t('col_business')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.label}>
                <TableCell className="font-medium">{row.label}</TableCell>
                <PlanCell value={row.starter} />
                <PlanCell value={row.pro} highlight />
                <PlanCell value={row.business} />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Section>
  );
}
