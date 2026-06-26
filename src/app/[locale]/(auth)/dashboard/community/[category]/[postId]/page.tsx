import { auth } from '@clerk/nextjs/server';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { CommunityModeProvider } from '@/components/community/community-mode';
import { PostDetail } from '@/components/community/post-detail';
import { getPost, listComments } from '@/libs/Community';

type DashboardPostPageProps = {
  params: Promise<{ locale: string; category: string; postId: string }>;
};

export default async function DashboardPostPage(props: DashboardPostPageProps) {
  const { locale, category, postId } = await props.params;
  setRequestLocale(locale);

  const { userId } = await auth();
  const post = await getPost({ id: postId, viewerId: userId ?? undefined });

  if (!post || post.category !== category) {
    notFound();
  }

  const comments = await listComments({ postId: post.id, viewerId: userId ?? undefined });

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6">
      <CommunityModeProvider interactive basePath="/dashboard/community">
        <PostDetail
          locale={locale}
          basePath="/dashboard/community"
          interactive
          post={post}
          comments={comments}
          viewerId={userId ?? undefined}
        />
      </CommunityModeProvider>
    </div>
  );
}
