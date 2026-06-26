import { useTranslations } from 'next-intl';
import { cineAspects } from '@/data/cinetype';
import { cn } from '@/lib/utils';
import type { CineType } from '@/types/CineType';

// Four chips — one per aspect — showing the type's chosen pole letter with its
// aspect name. Reused on directory cards and the detail header.
export function CineLetterChips(props: { type: CineType; className?: string }) {
  const t = useTranslations('CineType');

  return (
    <ul className={cn('grid grid-cols-4 gap-2', props.className)}>
      {cineAspects.map((aspect) => {
        const letter = props.type.letters[aspect.kind];

        return (
          <li
            key={aspect.kind}
            className="flex flex-col items-center gap-1 rounded-xl border bg-background px-2 py-3 text-center ring-1 ring-foreground/5"
          >
            <span className="font-heading text-2xl leading-none font-semibold">{letter}</span>
            <span className="text-[0.7rem] text-muted-foreground">
              {t(`aspect_${aspect.kind}_name`)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
