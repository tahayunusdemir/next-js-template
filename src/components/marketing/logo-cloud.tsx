import {
  SiImdb,
  SiLetterboxd,
  SiMubi,
  SiNetflix,
  SiPlex,
  SiRottentomatoes,
  SiThemoviedatabase,
  SiTrakt,
} from '@icons-pack/react-simple-icons';
import { useTranslations } from 'next-intl';

// Real brand marks rendered monochrome (Simple Icons) for an authentic film logo cloud.
const logos = [
  { Icon: SiThemoviedatabase, name: 'TMDB' },
  { Icon: SiImdb, name: 'IMDb' },
  { Icon: SiLetterboxd, name: 'Letterboxd' },
  { Icon: SiRottentomatoes, name: 'Rotten Tomatoes' },
  { Icon: SiNetflix, name: 'Netflix' },
  { Icon: SiMubi, name: 'MUBI' },
  { Icon: SiTrakt, name: 'Trakt' },
  { Icon: SiPlex, name: 'Plex' },
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
