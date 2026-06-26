import { cn } from '@/lib/utils';

// Dashed divider that fades out at both ends via a gradient mask.
export function DashedLine(props: { orientation?: 'horizontal' | 'vertical'; className?: string }) {
  const isHorizontal = (props.orientation ?? 'horizontal') === 'horizontal';

  return (
    <div
      className={cn(
        'relative text-border',
        isHorizontal ? 'h-px w-full' : 'h-full w-px',
        props.className,
      )}
    >
      <div
        className={cn(
          isHorizontal
            ? [
                'h-px w-full',
                'bg-[repeating-linear-gradient(90deg,transparent,transparent_4px,currentColor_4px,currentColor_10px)]',
                '[mask-image:linear-gradient(90deg,transparent,black_25%,black_75%,transparent)]',
              ]
            : [
                'h-full w-px',
                'bg-[repeating-linear-gradient(180deg,transparent,transparent_4px,currentColor_4px,currentColor_10px)]',
                '[mask-image:linear-gradient(180deg,transparent,black_25%,black_75%,transparent)]',
              ],
        )}
      />
    </div>
  );
}
