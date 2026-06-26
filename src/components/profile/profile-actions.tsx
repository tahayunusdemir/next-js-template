'use client';

import { FlagIcon, Share2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { toast } from 'sonner';
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

// Viewer-only share/report actions. The follow/block button is rendered separately
// (FollowButton); the owner's own profile hides Report. No Clerk client hooks here.
export function ProfileActions(props: { isOwner?: boolean }) {
  const t = useTranslations('ProfilePage');
  const [reportOpen, setReportOpen] = React.useState(false);

  const share = async () => {
    // Clipboard access throws in insecure contexts or when the user denies permission.
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(t('share_copied'));
    } catch {
      toast.error(t('action_error'));
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="ghost" onClick={share}>
        <Share2Icon />
        {t('share')}
      </Button>
      {props.isOwner ? null : (
        <Dialog open={reportOpen} onOpenChange={setReportOpen}>
          <DialogTrigger
            render={
              <Button variant="ghost" size="icon" aria-label={t('report')}>
                <FlagIcon />
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('report_title')}</DialogTitle>
              <DialogDescription>{t('report_description')}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>{t('report_cancel')}</DialogClose>
              <Button
                variant="destructive"
                onClick={() => {
                  setReportOpen(false);
                  toast.success(t('report_sent'));
                }}
              >
                {t('report_submit')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
