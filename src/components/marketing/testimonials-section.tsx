import { useTranslations } from 'next-intl';
import { Section, SectionHeading } from '@/components/marketing/section';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function TestimonialCard(props: { quote: string; name: string; role: string }) {
  return (
    <figure className="flex h-full flex-col rounded-xl border bg-card p-6 ring-1 ring-foreground/10 transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-lg">
      <blockquote className="flex-1 text-sm text-pretty text-foreground/90">
        “{props.quote}”
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <Avatar className="size-9">
          <AvatarFallback className="text-xs">{initials(props.name)}</AvatarFallback>
        </Avatar>
        <div className="leading-tight">
          <div className="text-sm font-medium">{props.name}</div>
          <div className="text-xs text-muted-foreground">{props.role}</div>
        </div>
      </figcaption>
    </figure>
  );
}

export function TestimonialsSection() {
  const t = useTranslations('Testimonials');

  const testimonials = [
    { quote: t('quote_1'), name: t('name_1'), role: t('role_1') },
    { quote: t('quote_2'), name: t('name_2'), role: t('role_2') },
    { quote: t('quote_3'), name: t('name_3'), role: t('role_3') },
    { quote: t('quote_4'), name: t('name_4'), role: t('role_4') },
    { quote: t('quote_5'), name: t('name_5'), role: t('role_5') },
    { quote: t('quote_6'), name: t('name_6'), role: t('role_6') },
  ];

  return (
    <Section id="testimonials">
      <SectionHeading badge={t('badge')} title={t('title')} subtitle={t('subtitle')} />
      <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((item) => (
          <TestimonialCard key={item.name} quote={item.quote} name={item.name} role={item.role} />
        ))}
      </div>
    </Section>
  );
}
