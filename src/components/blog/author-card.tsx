import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { authors } from '@/libs/Authors';
import type { AuthorKey } from '@/libs/Authors';

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// Renders a post author. Name and role resolve from the shared `Team` namespace so
// authors stay in sync with the about page.
export function AuthorCard(props: { authorKey: AuthorKey; className?: string }) {
  const t = useTranslations('Team');
  const author = authors[props.authorKey];
  const name = t(`${author.teamKey}_name`);
  const role = t(`${author.teamKey}_role`);

  return (
    <div className={cn('flex items-center gap-3', props.className)}>
      <Avatar className="size-10">
        <AvatarImage src={author.image} alt={name} />
        <AvatarFallback>{initials(name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="truncate text-xs text-muted-foreground">{role}</p>
      </div>
    </div>
  );
}
