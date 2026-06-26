import { CalendarIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getCineTypeBySlug } from '@/data/cinetype';
import { countryName, flagEmoji } from '@/lib/countries';
import { initialsOf, profileDisplayName } from '@/lib/profile';
import { Link } from '@/libs/I18nNavigation';
import type { CineTypeSlug } from '@/types/CineType';

type ProfileHeaderProps = {
  displayName?: string | null;
  handle: string;
  avatarUrl?: string | null;
  country?: string | null;
  joinedAt: Date;
  cineType?: CineTypeSlug | null;
  level: number;
  followers: number;
  following: number;
  locale: string;
};

export function ProfileHeader(props: ProfileHeaderProps) {
  const t = useTranslations('ProfilePage');
  const tType = useTranslations('CineType');

  const name = profileDisplayName({ displayName: props.displayName, handle: props.handle });
  const initials = initialsOf(name);
  const joined = new Intl.DateTimeFormat(props.locale, {
    month: 'short',
    year: 'numeric',
  }).format(props.joinedAt);
  const cineType = props.cineType ? getCineTypeBySlug(props.cineType) : undefined;

  return (
    <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
      <Avatar className="size-20 rounded-2xl">
        <AvatarImage src={props.avatarUrl ?? ''} alt={name} />
        <AvatarFallback className="rounded-2xl text-lg">{initials}</AvatarFallback>
      </Avatar>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl font-semibold tracking-tight">{name}</h1>
          <p className="text-sm text-muted-foreground">@{props.handle}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 text-sm sm:justify-start">
          <Link href={`/u/${props.handle}/followers`} className="hover:underline">
            <span className="font-semibold">{props.followers}</span>{' '}
            <span className="text-muted-foreground">{t('followers_count_label')}</span>
          </Link>
          <Link href={`/u/${props.handle}/following`} className="hover:underline">
            <span className="font-semibold">{props.following}</span>{' '}
            <span className="text-muted-foreground">{t('following_count_label')}</span>
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          {cineType ? (
            <Badge variant="secondary" render={<Link href={`/cinetype/${cineType.slug}`} />}>
              {tType(`${cineType.slug}_name`)}
            </Badge>
          ) : null}
          <Badge variant="outline">{t('level', { level: props.level })}</Badge>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground sm:justify-start">
          {props.country ? (
            <span className="inline-flex items-center gap-1">
              <span aria-hidden>{flagEmoji(props.country)}</span>
              {countryName(props.country, props.locale)}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <CalendarIcon className="size-3.5" />
            {t('joined', { date: joined })}
          </span>
        </div>
      </div>
    </div>
  );
}
