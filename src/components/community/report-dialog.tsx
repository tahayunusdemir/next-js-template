'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { reportAction } from '@/app/[locale]/(marketing)/community/actions';
import { useCommunityAction } from '@/components/community/use-community-action';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { COMMUNITY_REPORT_REASONS } from '@/types/Community';
import type { CommunityReportReason, CommunityTarget } from '@/types/Community';
import { REPORT_DETAIL_MAX } from '@/validations/CommunityValidation';

// Report dialog for a post or comment. The caller supplies the trigger element.
export function ReportDialog(props: {
  targetType: CommunityTarget;
  targetId: string;
  trigger: React.ReactElement;
}) {
  const { t, onFailure } = useCommunityAction();
  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState<CommunityReportReason>('spam');
  const [detail, setDetail] = React.useState('');
  const [pending, setPending] = React.useState(false);

  async function submit() {
    setPending(true);
    const result = await reportAction({
      targetType: props.targetType,
      targetId: props.targetId,
      reason,
      detail: detail.trim() || undefined,
    });
    setPending(false);

    if (result.ok) {
      toast.success(t('report_success'));
      setReason('spam');
      setDetail('');
      setOpen(false);
    } else {
      onFailure(result.reason);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={props.trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('report_title')}</DialogTitle>
          <DialogDescription>{t('report_description')}</DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="report-reason">{t('report_reason_label')}</Label>
            <NativeSelect
              id="report-reason"
              value={reason}
              onChange={(event) => {
                const next = COMMUNITY_REPORT_REASONS.find((value) => value === event.target.value);

                if (next) {
                  setReason(next);
                }
              }}
            >
              {COMMUNITY_REPORT_REASONS.map((value) => (
                <NativeSelectOption key={value} value={value}>
                  {t(`report_reason_${value}`)}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
          <Textarea
            aria-label={t('report_detail_placeholder')}
            maxLength={REPORT_DETAIL_MAX}
            value={detail}
            onChange={(event) => {
              setDetail(event.target.value);
            }}
            placeholder={t('report_detail_placeholder')}
            className="min-h-20 resize-none"
          />
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="ghost" />}>
              {t('cancel')}
            </DialogClose>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? t('reporting') : t('report_submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
