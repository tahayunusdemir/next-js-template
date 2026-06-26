'use client';

import { CheckIcon, LinkIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

// Copies the article's canonical link so it can be shared anywhere. Single, quiet action
// — no per-network share targets.
export function PostActions(props: { shareUrl: string }) {
  const t = useTranslations('Blog');
  const [copied, setCopied] = React.useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(props.shareUrl);
    } catch {
      toast.error(t('copy_failed'));
      return;
    }

    setCopied(true);
    toast.success(t('link_copied'));
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={copyLink}
      className="gap-2 rounded-full"
    >
      {copied ? <CheckIcon className="size-4" /> : <LinkIcon className="size-4" />}
      {t('copy_link')}
    </Button>
  );
}
