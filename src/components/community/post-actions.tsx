'use client';

import { FlagIcon, PencilIcon, Share2Icon, Trash2Icon } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { removePostAction, updatePostAction } from '@/app/[locale]/(marketing)/community/actions';
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CommunityCategorySlug } from '@/types/Community';
import { POST_BODY_MAX, POST_TITLE_MAX, POST_TITLE_MIN } from '@/validations/CommunityValidation';

// Action row on the post detail: share for everyone, edit + delete for the author, otherwise
// report. Edit and delete go through the author-guarded server actions.
export function PostActions(props: {
  postId: string;
  category: CommunityCategorySlug;
  title: string;
  body: string;
  isOwner: boolean;
}) {
  const { t, router, basePath, interactive, guard, onFailure } = useCommunityAction();
  const [editOpen, setEditOpen] = React.useState(false);
  const [title, setTitle] = React.useState(props.title);
  const [body, setBody] = React.useState(props.body);
  const [pending, setPending] = React.useState(false);

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(t('link_copied'));
    } catch {
      toast.error(t('action_error'));
    }
  }

  async function saveEdit() {
    if (!guard()) {
      return;
    }

    setPending(true);
    const result = await updatePostAction({ postId: props.postId, title, body });
    setPending(false);

    if (result.ok) {
      toast.success(t('post_updated'));
      setEditOpen(false);
      router.refresh();
    } else {
      onFailure(result.reason);
    }
  }

  async function remove() {
    if (!guard()) {
      return;
    }

    setPending(true);
    const result = await removePostAction(props.postId);
    setPending(false);

    if (result.ok) {
      toast.success(t('post_deleted'));
      router.push(`${basePath}/${props.category}`);
    } else {
      onFailure(result.reason);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="gap-1 text-muted-foreground"
        onClick={() => {
          void share();
        }}
      >
        <Share2Icon className="size-4" />
        {t('share')}
      </Button>

      {interactive && props.isOwner ? (
        <>
          <Dialog
            open={editOpen}
            onOpenChange={(open) => {
              // Discard any unsaved edits when reopening by resetting to the current post.
              if (open) {
                setTitle(props.title);
                setBody(props.body);
              }

              setEditOpen(open);
            }}
          >
            <DialogTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-muted-foreground"
                />
              }
            >
              <PencilIcon className="size-4" />
              {t('edit')}
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('edit_title')}</DialogTitle>
              </DialogHeader>
              <form
                className="flex flex-col gap-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  void saveEdit();
                }}
              >
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-title">{t('title_label')}</Label>
                  <Input
                    id="edit-title"
                    required
                    maxLength={POST_TITLE_MAX}
                    value={title}
                    onChange={(event) => {
                      setTitle(event.target.value);
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-body">{t('body_label')}</Label>
                  <Textarea
                    id="edit-body"
                    required
                    maxLength={POST_BODY_MAX}
                    value={body}
                    onChange={(event) => {
                      setBody(event.target.value);
                    }}
                    className="min-h-40 resize-y"
                  />
                </div>
                <DialogFooter>
                  <DialogClose render={<Button type="button" variant="ghost" />}>
                    {t('cancel')}
                  </DialogClose>
                  <Button
                    type="submit"
                    disabled={
                      pending || title.trim().length < POST_TITLE_MIN || body.trim().length === 0
                    }
                  >
                    {pending ? t('saving') : t('save')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-muted-foreground"
                />
              }
            >
              <Trash2Icon className="size-4" />
              {t('delete')}
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('delete_post_title')}</AlertDialogTitle>
                <AlertDialogDescription>{t('delete_post_description')}</AlertDialogDescription>
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
        </>
      ) : null}

      {interactive && !props.isOwner ? (
        <ReportDialog
          targetType="post"
          targetId={props.postId}
          trigger={
            <Button type="button" variant="ghost" size="sm" className="gap-1 text-muted-foreground">
              <FlagIcon className="size-4" />
              {t('report')}
            </Button>
          }
        />
      ) : null}
    </div>
  );
}
