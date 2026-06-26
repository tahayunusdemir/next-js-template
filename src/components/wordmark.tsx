import { cn } from '@/lib/utils';

// Renders the CinePersona wordmark with the "Persona" half in brand gold.
export function Wordmark(props: { className?: string }) {
  return (
    <span className={cn('font-heading font-semibold tracking-tight', props.className)}>
      Cine<span className="text-brand-gold">Persona</span>
    </span>
  );
}
