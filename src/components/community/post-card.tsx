import { MessageSquareIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { CategoryIcon } from '@/components/community/category-icon';
import { VoteButtons } from '@/components/community/vote-buttons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getCommunityCategory } from '@/data/community-categories';
import type { PostListItem } from '@/libs/Community';
import { Link } from '@/libs/I18nNavigation';
import { authorInitials, authorName } from '@/utils/Author';
import { formatRelativeTime } from '@/utils/Time';

// A single post row for the community feeds: vote rail + category/author meta + title and
// an excerpt linking to the post detail, with the comment count.
export async function PostCard(props: { post: PostListItem; locale: string; basePath: string }) {
  const t = await getTranslations({ locale: props.locale, namespace: 'CommunityPage' });
  const { post } = props;
  const category = getCommunityCategory(post.category);
  const name = authorName(post.author);
  const initials = authorInitials(name);
  const href = `${props.basePath}/${post.category}/${post.id}`;

  return (
    <article className="flex gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <VoteButtons
        targetType="post"
        targetId={post.id}
        score={post.score}
        viewerVote={post.viewerVote}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <Link
            href={`${props.basePath}/${post.category}`}
            className="inline-flex items-center gap-1 font-medium text-foreground hover:underline"
          >
            {category ? <CategoryIcon name={category.icon} className="size-3.5" /> : null}
            {t(`category_${post.category}_name`)}
          </Link>
          <span aria-hidden>·</span>
          <Avatar className="size-4 rounded-full">
            {post.author.avatarUrl ? <AvatarImage src={post.author.avatarUrl} alt={name} /> : null}
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

        <Link href={href} className="min-w-0">
          <h3 className="font-heading text-base leading-snug font-medium">{post.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{post.body}</p>
        </Link>

        <Link
          href={href}
          className="inline-flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <MessageSquareIcon className="size-3.5" />
          {t('comment_count', { count: post.commentCount })}
        </Link>
      </div>
    </article>
  );
}
