import {
  SiAsana,
  SiFigma,
  SiGithub,
  SiLinear,
  SiNotion,
  SiStripe,
  SiVercel,
  SiZapier,
} from '@icons-pack/react-simple-icons';
import { useTranslations } from 'next-intl';

// Real brand marks rendered monochrome (Simple Icons) for an authentic logo cloud.
const logos = [
  { Icon: SiNotion, name: 'Notion' },
  { Icon: SiLinear, name: 'Linear' },
  { Icon: SiGithub, name: 'GitHub' },
  { Icon: SiVercel, name: 'Vercel' },
  { Icon: SiFigma, name: 'Figma' },
  { Icon: SiStripe, name: 'Stripe' },
  { Icon: SiZapier, name: 'Zapier' },
  { Icon: SiAsana, name: 'Asana' },
];

export function LogoCloud() {
  const t = useTranslations('LogoCloud');

  return (
    <section className="border-b border-dashed py-12">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-muted-foreground">{t('title')}</p>
        <div className="relative mt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex w-max animate-marquee items-center gap-12 pr-12 hover:[animation-play-state:paused]">
            {[...logos, ...logos].map((logo, index) => (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: duplicated track needs positional keys
                key={`${logo.name}-${index}`}
                className="flex shrink-0 items-center gap-2 text-muted-foreground/70 transition-colors hover:text-foreground"
              >
                <logo.Icon className="size-5" color="currentColor" aria-hidden />
                <span className="font-heading text-lg font-semibold tracking-tight">
                  {logo.name}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
