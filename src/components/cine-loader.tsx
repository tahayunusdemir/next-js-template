import Image from 'next/image';
import { Wordmark } from '@/components/wordmark';

// Full-screen brand splash used as the shared route-transition fallback.
export function CineLoader(props: { label: string }) {
  return (
    <output className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 motion-safe:animate-cine-zoom">
        <Image
          src="/favicon-96x96.png"
          alt=""
          width={64}
          height={64}
          className="size-16"
          priority
        />
        <Wordmark className="text-2xl" />
      </div>
      <span className="sr-only">{props.label}</span>
    </output>
  );
}
