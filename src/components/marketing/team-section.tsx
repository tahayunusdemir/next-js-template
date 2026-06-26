import { MailIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { LinkedinIcon } from '@/components/icons/linkedin-icon';
import { Section, SectionHeading } from '@/components/marketing/section';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const socialLinkClassName =
  'flex size-9 items-center justify-center rounded-lg border bg-card text-muted-foreground transition-colors hover:text-foreground';

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// Photos, emails and profile URLs are not localized, so they live alongside the keys.
const members = [
  {
    key: 'member_1',
    image: '/team/taha.png',
    email: 'tahayunusdemir@gmail.com',
    linkedin: 'https://www.linkedin.com/in/taha-yunus-demir/',
  },
  {
    key: 'member_2',
    image: '/team/kemal.png',
    email: 'alpkemalpehlivanli@gmail.com',
    linkedin: 'https://www.linkedin.com/in/alpaslankemal',
  },
  {
    key: 'member_3',
    image: '/team/firat.png',
    email: 'piratfala@gmail.com',
    linkedin: 'https://www.linkedin.com/in/fırat-pala-431a9226a',
  },
] as const;

export function TeamSection() {
  const t = useTranslations('Team');

  return (
    <Section id="team">
      <SectionHeading badge={t('badge')} title={t('title')} subtitle={t('subtitle')} />

      <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => {
          const name = t(`${member.key}_name`);

          return (
            <div
              key={member.key}
              className="group flex flex-col items-center rounded-2xl border bg-card p-6 text-center ring-1 ring-foreground/10 transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <Avatar className="size-24 transition-transform duration-300 group-hover:scale-105">
                <AvatarImage src={member.image} alt={name} />
                <AvatarFallback className="text-xl">{initials(name)}</AvatarFallback>
              </Avatar>

              <div className="mt-4 flex flex-1 flex-col items-center">
                <h3 className="font-heading text-lg font-medium">{name}</h3>
                <p className="text-sm text-primary">{t(`${member.key}_role`)}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t(`${member.key}_department`)}
                </p>
                <p className="text-sm text-pretty text-muted-foreground">
                  {t(`${member.key}_university`)}
                </p>

                <div className="mt-auto flex gap-2 pt-5">
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t('member_linkedin_label', { name })}
                    className={socialLinkClassName}
                  >
                    <LinkedinIcon className="size-4" />
                  </a>
                  <a
                    href={`mailto:${member.email}`}
                    aria-label={t('member_email_label', { name })}
                    className={socialLinkClassName}
                  >
                    <MailIcon className="size-4" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
