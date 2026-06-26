'use client';

import * as React from 'react';
import { createCommentAction } from '@/app/[locale]/(marketing)/community/actions';
import { useCommunityAction } from '@/components/community/use-community-action';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { COMMENT_BODY_MAX } from '@/validations/CommunityValidation';

// Comment / reply box. `parentId` makes it a threaded reply; `onDone` (when provided)
// closes an inline reply box after a successful submit.
export function CommentComposer(props: {
  postId: string;
  parentId?: string;
  autoFocus?: boolean;
  onDone?: () => void;
}) {
  const { t, router, guard, onFailure } = useCommunityAction();
  const [body, setBody] = React.useState('');
  const [pending, setPending] = React.useState(false);
  const isReply = Boolean(props.parentId);
  const submitLabel = isReply ? t('reply_submit') : t('comment_submit');

  async function submit() {
    if (!guard()) {
      return;
    }

    setPending(true);
    const result = await createCommentAction({
      postId: props.postId,
      parentId: props.parentId,
      body,
    });
    setPending(false);

    if (result.ok) {
      setBody('');
      props.onDone?.();
      router.refresh();
    } else {
      onFailure(result.reason);
    }
  }

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <Textarea
        aria-label={isReply ? t('reply_placeholder') : t('comment_placeholder')}
        autoFocus={props.autoFocus}
        required
        maxLength={COMMENT_BODY_MAX}
        value={body}
        onChange={(event) => {
          setBody(event.target.value);
        }}
        placeholder={isReply ? t('reply_placeholder') : t('comment_placeholder')}
        className="min-h-20 resize-y"
      />
      <div className="flex justify-end gap-2">
        {props.onDone ? (
          <Button type="button" variant="ghost" size="sm" onClick={props.onDone}>
            {t('cancel')}
          </Button>
        ) : null}
        <Button type="submit" size="sm" disabled={pending || body.trim().length === 0}>
          {pending ? t('posting') : submitLabel}
        </Button>
      </div>
    </form>
  );
}
