'use client';

import { FlagIcon, ReplyIcon, Trash2Icon } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { removeCommentAction } from '@/app/[locale]/(marketing)/community/actions';
import { CommentComposer } from '@/components/community/comment-composer';
import { ReportDialog } from '@/components/community/report-dialog';
import { useCommunityAction } from '@/components/community/use-community-action';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

// Inline action row under a comment: reply toggle, report (others) or delete (owner). The
// vote control sits beside it in the parent so this island only owns the reply box state.
export function CommentActions(props: { commentId: string; postId: string; isOwner: boolean }) {
  const { t, router, interactive, guard, onFailure } = useCommunityAction();
  const [replyOpen, setReplyOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function remove() {
    if (!guard()) {
      return;
    }

    setPending(true);
    const result = await removeCommentAction(props.commentId);
    setPending(false);

    if (result.ok) {
      toast.success(t('comment_deleted'));
      router.refresh();
    } else {
      onFailure(result.reason);
    }
  }

  // The public feed is read-only: replies, deletes, and reports live in the dashboard.
  if (!interactive) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-muted-foreground"
          onClick={() => {
            setReplyOpen((open) => !open);
          }}
        >
          <ReplyIcon className="size-3.5" />
          {t('reply')}
        </Button>

        {props.isOwner ? (
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 px-2 text-muted-foreground"
                />
              }
            >
              <Trash2Icon className="size-3.5" />
              {t('delete')}
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('delete_comment_title')}</AlertDialogTitle>
                <AlertDialogDescription>{t('delete_comment_description')}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={pending}
                  onClick={() => {
                    void remove();
                  }}
                >
                  {t('delete_confirm')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <ReportDialog
            targetType="comment"
            targetId={props.commentId}
            trigger={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1 px-2 text-muted-foreground"
              >
                <FlagIcon className="size-3.5" />
                {t('report')}
              </Button>
            }
          />
        )}
      </div>

      {replyOpen ? (
        <CommentComposer
          postId={props.postId}
          parentId={props.commentId}
          autoFocus
          onDone={() => {
            setReplyOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
