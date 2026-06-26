import { useTranslations } from 'next-intl';
import { Section, SectionHeading } from '@/components/marketing/section';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// The four recurring questions: the bar, the fallback, what a match can see, and leaving.
export function CineMatchFaq() {
  const t = useTranslations('CineMatchPage');

  const items = [
    { question: t('faq_q1'), answer: t('faq_a1') },
    { question: t('faq_q2'), answer: t('faq_a2') },
    { question: t('faq_q3'), answer: t('faq_a3') },
    { question: t('faq_q4'), answer: t('faq_a4') },
  ];

  return (
    <Section id="faq">
      <SectionHeading badge={t('faq_badge')} title={t('faq_title')} subtitle={t('faq_subtitle')} />

      <div className="mx-auto mt-12 max-w-3xl">
        <Accordion>
          {items.map((item) => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger>
                <span className="text-base">{item.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  );
}
