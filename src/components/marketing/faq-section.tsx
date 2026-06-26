import {
  DatabaseIcon,
  FilmIcon,
  PopcornIcon,
  SparklesIcon,
  UsersIcon,
  WalletIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Reveal } from '@/components/marketing/reveal';
import { Section, SectionHeading } from '@/components/marketing/section';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from '@/libs/I18nNavigation';

const icons: LucideIcon[] = [
  SparklesIcon,
  WalletIcon,
  FilmIcon,
  UsersIcon,
  PopcornIcon,
  DatabaseIcon,
];

export function FaqSection() {
  const t = useTranslations('Faq');

  const items = [
    { question: t('q1'), answer: t('a1') },
    { question: t('q2'), answer: t('a2') },
    { question: t('q3'), answer: t('a3') },
    { question: t('q4'), answer: t('a4') },
    { question: t('q5'), answer: t('a5') },
    { question: t('q6'), answer: t('a6') },
  ];

  return (
    <Section id="faq">
      <SectionHeading badge={t('badge')} title={t('title')} subtitle={t('subtitle')} />

      <Reveal className="mx-auto mt-12 max-w-3xl">
        <Accordion>
          {items.map((item, index) => {
            const Icon = icons[index] ?? SparklesIcon;
            return (
              <AccordionItem key={item.question} value={item.question}>
                <AccordionTrigger>
                  <span className="flex items-center gap-3 text-base">
                    <Icon className="size-4 shrink-0 text-muted-foreground" />
                    {item.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pl-7 text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-xl border bg-muted/40 p-6 text-center sm:flex-row sm:text-left">
          <div>
            <h3 className="font-heading text-base font-medium">{t('support_title')}</h3>
            <p className="text-sm text-muted-foreground">{t('support_description')}</p>
          </div>
          <Link
            href="/about#contact"
            className={cn(buttonVariants({ variant: 'outline' }), 'rounded-full')}
          >
            {t('support_cta')}
          </Link>
        </div>
      </Reveal>
    </Section>
  );
}
