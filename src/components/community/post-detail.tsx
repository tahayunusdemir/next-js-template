import { ChevronLeftIcon, LockIcon, MessageSquareIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { CategoryIcon } from '@/components/community/category-icon';
import { CommentComposer } from '@/components/community/comment-composer';
import { CommentThread } from '@/components/community/comment-thread';
import { CommunityEmpty } from '@/components/community/community-empty';
import { PostActions } from '@/components/community/post-actions';
import { VoteButtons } from '@/components/community/vote-buttons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getCommunityCategory } from '@/data/community-categories';
import type { CommentListItem, PostDetailItem } from '@/libs/Community';
import { Link } from '@/libs/I18nNavigation';
import { authorInitials, authorName } from '@/utils/Author';
import { formatRelativeTime } from '@/utils/Time';

// Shared post detail body: the post with its vote rail and actions, plus the comment thread.
// `basePath` roots the links and `interactive` decides whether the comment composer shows or
// a read-only prompt sends visitors to the dashboard to join in.
export async function PostDetail(props: {
  locale: string;
  basePath: string;
  interactive: boolean;
  post: PostDetailItem;
  comments: CommentListItem[];
  viewerId?: string;
}) {
  const t = await getTranslations({ locale: props.locale, namespace: 'CommunityPage' });
  const { post } = props;
  const found = getCommunityCategory(post.category);
  const name = authorName(post.author);
  const initials = authorInitials(name);
  const isOwner = Boolean(props.viewerId && post.author.id === props.viewerId);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Link
        href={`${props.basePath}/${post.category}`}
        className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeftIcon className="size-4" />
        {found ? t(`category_${found.slug}_name`) : t('title')}
      </Link>

      <article className="flex gap-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
        <VoteButtons
          targetType="post"
          targetId={post.id}
          score={post.score}
          viewerVote={post.viewerVote}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            {found ? (
              <Link
                href={`${props.basePath}/${post.category}`}
                className="inline-flex items-center gap-1 font-medium text-foreground hover:underline"
              >
                <CategoryIcon name={found.icon} className="size-3.5" />
                {t(`category_${post.category}_name`)}
              </Link>
            ) : null}
            <span aria-hidden>·</span>
            <Avatar className="size-4 rounded-full">
              <AvatarImage src={post.author.avatarUrl ?? ''} alt={name} />
              <AvatarFallback className="rounded-full text-[8px]">{initials}</AvatarFallback>
            </Avatar>
            <Link href={`/u/${post.author.handle}`} className="hover:underline">
              {name}
            </Link>
            <span aria-hidden>·</span>
            <time dateTime={post.createdAt.toISOString()}>
              {formatRelativeTime(post.createdAt, props.locale)}
            </time>
          </div>

          <h1 className="font-heading text-2xl font-semibold tracking-tight">{post.title}</h1>
          <p className="text-sm whitespace-pre-wrap text-foreground/90">{post.body}</p>

          <PostActions
            postId={post.id}
            category={post.category}
            title={post.title}
            body={post.body}
            isOwner={isOwner}
          />
        </div>
      </article>

      <div className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2 font-heading text-lg font-medium">
          <MessageSquareIcon className="size-5" />
          {t('comment_count', { count: post.commentCount })}
        </h2>

        {props.interactive ? (
          <CommentComposer postId={post.id} />
        ) : (
          <Link
            href="/dashboard/community"
            className="flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:text-foreground"
          >
            <LockIcon className="size-4" />
            {t('read_only_notice')}
          </Link>
        )}

        {props.comments.length ? (
          <CommentThread
            comments={props.comments}
            postId={post.id}
            viewerId={props.viewerId}
            locale={props.locale}
          />
        ) : (
          <CommunityEmpty message={t('comment_empty')} />
        )}
      </div>
    </div>
  );
}
