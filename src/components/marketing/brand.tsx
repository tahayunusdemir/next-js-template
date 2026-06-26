import Image from 'next/image';
import { Wordmark } from '@/components/wordmark';
import { cn } from '@/lib/utils';

// Wordmark used in the marketing header and footer.
export function Brand(props: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-2', props.className)}>
      <Image src="/favicon-96x96.png" alt="" width={32} height={32} className="size-8" priority />
      <Wordmark className="text-base" />
    </span>
  );
}
