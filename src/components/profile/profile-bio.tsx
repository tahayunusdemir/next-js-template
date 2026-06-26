import { detectPlatform, shortHandle } from '@/lib/socials';

// Normalizes a stored URL to an absolute href.
function href(url: string) {
  return /^https?:\/\//iu.test(url) ? url : `https://${url}`;
}

export function ProfileBio(props: { bio?: string | null; website?: string | null }) {
  if (!props.bio && !props.website) {
    return null;
  }

  const platform = props.website ? detectPlatform(props.website) : undefined;

  return (
    <div className="flex flex-col gap-2">
      {props.bio ? <p className="text-sm leading-relaxed text-foreground/90">{props.bio}</p> : null}
      {props.website && platform ? (
        <a
          href={href(props.website)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${platform.label} — ${shortHandle(props.website)}`}
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <platform.Icon className="size-3.5" />
          {shortHandle(props.website)}
        </a>
      ) : null}
    </div>
  );
}
