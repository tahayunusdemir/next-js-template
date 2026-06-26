import { getTranslations } from 'next-intl/server';
import { CommentItem } from '@/components/community/comment-item';
import type { CommentListItem } from '@/libs/Community';

// Builds the reply tree from the flat comment list (grouped by `parentId`) and renders the
// roots; each `CommentItem` recurses into its replies. Resolves the tombstone label once and
// threads it down so deep trees don't re-fetch translations per node.
export async function CommentThread(props: {
  comments: CommentListItem[];
  postId: string;
  viewerId?: string;
  locale: string;
}) {
  const t = await getTranslations({ locale: props.locale, namespace: 'CommunityPage' });
  const byParent = new Map<string | null, CommentListItem[]>();

  for (const comment of props.comments) {
    const list = byParent.get(comment.parentId) ?? [];
    list.push(comment);
    byParent.set(comment.parentId, list);
  }

  const roots = byParent.get(null) ?? [];

  return (
    <div className="flex flex-col divide-y divide-border">
      {roots.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          childrenByParent={byParent}
          postId={props.postId}
          viewerId={props.viewerId}
          locale={props.locale}
          depth={0}
          removedLabel={t('comment_removed')}
        />
      ))}
    </div>
  );
}
