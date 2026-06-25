import { SparklesIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppConfig } from '@/utils/AppConfig';

// Wordmark used in the marketing header and footer.
export function Brand(props: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-2', props.className)}>
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <SparklesIcon className="size-4" />
      </span>
      <span className="font-heading text-base font-semibold tracking-tight">{AppConfig.name}</span>
    </span>
  );
}
