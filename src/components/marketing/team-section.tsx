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

function TeamCard(props: { name: string; role: string }) {
  return (
    <div className="group flex flex-col items-center rounded-xl border bg-card p-6 text-center ring-1 ring-foreground/10 transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-lg">
      <Avatar className="size-16 transition-transform duration-200 group-hover:scale-105">
        <AvatarFallback className="text-base">{initials(props.name)}</AvatarFallback>
      </Avatar>
      <div className="mt-4 font-heading text-base font-medium">{props.name}</div>
      <div className="text-sm text-muted-foreground">{props.role}</div>
    </div>
  );
}

export function TeamSection() {
  const t = useTranslations('Team');

  const members = [
    { name: t('member_1_name'), role: t('member_1_role') },
    { name: t('member_2_name'), role: t('member_2_role') },
    { name: t('member_3_name'), role: t('member_3_role') },
    { name: t('member_4_name'), role: t('member_4_role') },
  ];

  return (
    <Section id="team">
      <SectionHeading badge={t('badge')} title={t('title')} subtitle={t('subtitle')} />
      <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {members.map((member) => (
          <TeamCard key={member.name} name={member.name} role={member.role} />
        ))}
      </div>
    </Section>
  );
}
