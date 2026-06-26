import { InfoIcon, LightbulbIcon, LinkIcon, StickyNoteIcon, TriangleAlertIcon } from 'lucide-react';
import Image from 'next/image';
import type { BlogBlock, CalloutVariant } from '@/libs/Blog';
import { getHeadingIds } from '@/libs/Blog';

// Icon shown beside each callout variant. Monochrome — variants read by icon + label,
// not colour, to stay on the template's palette.
const CALLOUT_ICON: Record<CalloutVariant, typeof InfoIcon> = {
  note: StickyNoteIcon,
  tip: LightbulbIcon,
  warning: TriangleAlertIcon,
  info: InfoIcon,
};

type PostBodyProps = {
  blocks: BlogBlock[];
  calloutLabels: Record<CalloutVariant, string>;
  headingLinkLabel: string;
};

// Renders typed content blocks into styled, monochrome long-form copy. No `prose`
// dependency — each block maps to explicit, token-driven Tailwind classes.
export function PostBody(props: PostBodyProps) {
  const headingIds = getHeadingIds(props.blocks);

  return (
    <div className="max-w-none">
      {props.blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        if (block.type === 'heading') {
          const id = headingIds.get(index) ?? '';

          return (
            <h2
              key={key}
              id={id}
              className="group mt-12 mb-4 scroll-mt-28 font-heading text-2xl font-semibold tracking-tight first:mt-0"
            >
              <a
                href={`#${id}`}
                title={props.headingLinkLabel}
                className="inline-flex items-center gap-2 no-underline"
              >
                {block.text}
                <LinkIcon
                  aria-hidden
                  className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                />
              </a>
            </h2>
          );
        }

        if (block.type === 'paragraph') {
          return (
            <p key={key} className="mb-6 text-base leading-7 text-pretty text-muted-foreground">
              {block.text}
            </p>
          );
        }

        if (block.type === 'quote') {
          return (
            <blockquote
              key={key}
              className="my-8 border-l-2 border-foreground/30 pl-5 text-lg text-pretty text-foreground italic"
            >
              {block.text}
            </blockquote>
          );
        }

        if (block.type === 'code') {
          return (
            <pre
              key={key}
              className="mb-6 overflow-x-auto rounded-lg border bg-muted/50 p-4 text-sm leading-6"
            >
              <code>{block.code}</code>
            </pre>
          );
        }

        if (block.type === 'callout') {
          const Icon = CALLOUT_ICON[block.variant];

          return (
            <div
              key={key}
              className="my-8 flex gap-3 rounded-lg border border-l-2 border-l-foreground/40 bg-muted/40 p-4"
            >
              <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-foreground" />
              <div className="min-w-0">
                <p className="mb-1 text-sm font-semibold text-foreground">
                  {props.calloutLabels[block.variant]}
                </p>
                <p className="text-sm leading-6 text-pretty text-muted-foreground">{block.text}</p>
              </div>
            </div>
          );
        }

        if (block.type === 'image') {
          return (
            <figure key={key} className="my-8">
              <div className="overflow-hidden rounded-xl border bg-muted/30">
                <Image
                  src={block.src}
                  alt={block.alt}
                  width={1200}
                  height={675}
                  className="h-auto w-full grayscale transition-[filter] duration-500 ease-out hover:grayscale-0"
                  sizes="(min-width: 1024px) 48rem, 100vw"
                />
              </div>
              {block.caption ? (
                <figcaption className="mt-3 text-center text-sm text-muted-foreground">
                  {block.caption}
                </figcaption>
              ) : null}
            </figure>
          );
        }

        const ListTag = block.ordered ? 'ol' : 'ul';

        return (
          <ListTag
            key={key}
            className={`mb-6 space-y-2 pl-6 text-base leading-7 text-muted-foreground ${
              block.ordered ? 'list-decimal' : 'list-disc'
            }`}
          >
            {block.items.map((item, itemIndex) => (
              <li key={`${key}-${itemIndex}`}>{item}</li>
            ))}
          </ListTag>
        );
      })}
    </div>
  );
}
