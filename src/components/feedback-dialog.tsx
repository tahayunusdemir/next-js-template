'use client';

import { useTranslations } from 'next-intl';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

type FeedbackDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function FeedbackDialog(props: FeedbackDialogProps) {
  const t = useTranslations('DashboardLayout');
  const [message, setMessage] = React.useState('');

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setMessage('');
    }
    props.onOpenChange(open);
  };

  return (
    <Dialog open={props.open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('feedback_title')}</DialogTitle>
          <DialogDescription>{t('feedback_description')}</DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            handleOpenChange(false);
          }}
        >
          <Textarea
            autoFocus
            required
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
            }}
            placeholder={t('feedback_placeholder')}
            className="min-h-28 resize-none"
          />
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="ghost" />}>
              {t('feedback_cancel')}
            </DialogClose>
            <Button type="submit" disabled={message.trim().length === 0}>
              {t('feedback_send')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
