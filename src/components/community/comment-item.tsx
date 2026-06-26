import { CommentActions } from '@/components/community/comment-actions';
import { VoteButtons } from '@/components/community/vote-buttons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { CommentListItem } from '@/libs/Community';
import { Link } from '@/libs/I18nNavigation';
import { authorInitials, authorName } from '@/utils/Author';
import { formatRelativeTime } from '@/utils/Time';

// Visual indent cap: replies deeper than this keep threading in the data but stop shifting
// right, so deep chains stay readable instead of running off the edge.
const MAX_DEPTH = 5;

// One comment plus its reply subtree. Removed comments render as a tombstone but keep their
// replies so the thread stays intact. `childrenByParent` is the flat list grouped by parent;
// `removedLabel` is resolved once by the thread to avoid re-fetching translations per node.
export function CommentItem(props: {
  comment: CommentListItem;
  childrenByParent: Map<string | null, CommentListItem[]>;
  postId: string;
  viewerId?: string;
  locale: string;
  depth: number;
  removedLabel: string;
}) {
  const { comment } = props;
  const replies = props.childrenByParent.get(comment.id) ?? [];
  const isOwner = Boolean(props.viewerId && comment.author.id === props.viewerId);
  const name = authorName(comment.author);
  const initials = authorInitials(name);

  return (
    <div
      className={cn(props.depth > 0 && props.depth <= MAX_DEPTH && 'border-l border-border pl-4')}
    >
      <div className="flex flex-col gap-1.5 py-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Avatar className="size-5 rounded-full">
            {comment.author.avatarUrl ? (
              <AvatarImage src={comment.author.avatarUrl} alt={name} />
            ) : null}
            <AvatarFallback className="rounded-full text-[9px]">{initials}</AvatarFallback>
          </Avatar>
          <Link
            href={`/u/${comment.author.handle}`}
            className="font-medium text-foreground hover:underline"
          >
            {name}
          </Link>
          <span aria-hidden>·</span>
          <time dateTime={comment.createdAt.toISOString()}>
            {formatRelativeTime(comment.createdAt, props.locale)}
          </time>
        </div>

        {comment.isRemoved ? (
          <p className="text-sm text-muted-foreground italic">{props.removedLabel}</p>
        ) : (
          <p className="text-sm whitespace-pre-wrap">{comment.body}</p>
        )}

        {comment.isRemoved ? null : (
          <div className="flex items-center gap-2">
            <VoteButtons
              targetType="comment"
              targetId={comment.id}
              score={comment.score}
              viewerVote={comment.viewerVote}
              orientation="horizontal"
            />
            <CommentActions commentId={comment.id} postId={props.postId} isOwner={isOwner} />
          </div>
        )}
      </div>

      {replies.length ? (
        <div className="flex flex-col">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              childrenByParent={props.childrenByParent}
              postId={props.postId}
              viewerId={props.viewerId}
              locale={props.locale}
              depth={props.depth + 1}
              removedLabel={props.removedLabel}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
