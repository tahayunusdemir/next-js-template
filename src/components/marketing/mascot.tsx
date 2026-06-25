import { cn } from '@/lib/utils';

// Brand mascot placeholder. Swap the inner SVG paths for the real mascot artwork when
// it's ready — keep the viewBox, the cn(..., props.className) wrapper, and aria-hidden
// (the mascot is decorative; the headline carries the meaning).
export function Mascot(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 240"
      aria-hidden
      className={cn('h-auto w-full', props.className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* antenna */}
      <line
        x1="120"
        y1="38"
        x2="120"
        y2="66"
        className="stroke-border"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="120" cy="32" r="9" className="fill-foreground" />
      {/* body */}
      <rect
        x="46"
        y="64"
        width="148"
        height="130"
        rx="42"
        className="fill-card stroke-border"
        strokeWidth="3"
      />
      {/* screen / face plate */}
      <rect x="66" y="86" width="108" height="78" rx="26" className="fill-muted" />
      {/* eyes */}
      <circle cx="100" cy="120" r="9" className="fill-foreground" />
      <circle cx="140" cy="120" r="9" className="fill-foreground" />
      {/* smile */}
      <path
        d="M98 142 Q120 158 142 142"
        className="stroke-foreground"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      {/* feet */}
      <rect x="80" y="188" width="26" height="14" rx="7" className="fill-muted-foreground/40" />
      <rect x="134" y="188" width="26" height="14" rx="7" className="fill-muted-foreground/40" />
    </svg>
  );
}
