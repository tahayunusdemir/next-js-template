'use client';

import { useTranslations } from 'next-intl';
import * as React from 'react';
import { toast } from 'sonner';
import { sendFeedback } from '@/app/[locale]/(auth)/dashboard/actions';
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
import { Label } from '@/components/ui/label';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { FEEDBACK_MAX, FEEDBACK_SUBJECTS } from '@/validations/FeedbackValidation';

type FeedbackSubject = (typeof FEEDBACK_SUBJECTS)[number];

type FeedbackDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function FeedbackDialog(props: FeedbackDialogProps) {
  const t = useTranslations('DashboardLayout');
  const [subject, setSubject] = React.useState<FeedbackSubject>('general');
  const [message, setMessage] = React.useState('');
  const [pending, setPending] = React.useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSubject('general');
      setMessage('');
    }
    props.onOpenChange(open);
  };

  const submit = async () => {
    setPending(true);
    const result = await sendFeedback({ subject, message });
    setPending(false);

    if (result.ok) {
      toast.success(t('feedback_success'));
      handleOpenChange(false);
    } else {
      toast.error(t('feedback_error'));
    }
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
            void submit();
          }}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="feedback-subject">{t('feedback_subject_label')}</Label>
            <NativeSelect
              id="feedback-subject"
              className="w-full"
              value={subject}
              onChange={(event) => {
                const next = FEEDBACK_SUBJECTS.find((value) => value === event.target.value);

                if (next) {
                  setSubject(next);
                }
              }}
            >
              {FEEDBACK_SUBJECTS.map((value) => (
                <NativeSelectOption key={value} value={value}>
                  {t(`feedback_subject_${value}`)}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
          <Textarea
            autoFocus
            required
            maxLength={FEEDBACK_MAX}
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
            }}
            className="min-h-28 resize-none"
          />
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="ghost" />}>
              {t('feedback_cancel')}
            </DialogClose>
            <Button type="submit" disabled={pending || message.trim().length === 0}>
              {pending ? t('feedback_sending') : t('feedback_send')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
