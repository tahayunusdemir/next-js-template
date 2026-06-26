import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { initialsOf, profileDisplayName } from '@/lib/profile';
import { Link } from '@/libs/I18nNavigation';
import type { Connection } from '@/libs/Social';

// A single connections-list row: avatar + name + @handle, follower/following counts, and
// an optional trailing action slot (the follow/block button on interactive surfaces).
// `meta` is the pre-formatted follower/following label, resolved once by the parent list.
export function ConnectionRow(props: {
  connection: Connection;
  meta: string;
  actions?: React.ReactNode;
}) {
  const { connection } = props;

  const name = profileDisplayName(connection);
  const initials = initialsOf(name);

  return (
    <div className="flex items-center gap-3 py-3">
      <Link href={`/u/${connection.handle}`} className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar className="size-10 rounded-xl">
          <AvatarImage src={connection.avatarUrl ?? ''} alt={name} />
          <AvatarFallback className="rounded-xl text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium">{name}</span>
          <span className="truncate text-xs text-muted-foreground">{props.meta}</span>
        </div>
      </Link>
      {props.actions}
    </div>
  );
}
