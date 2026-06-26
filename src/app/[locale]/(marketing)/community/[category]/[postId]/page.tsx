import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { PostDetail } from '@/components/community/post-detail';
import { Section } from '@/components/marketing/section';
import { getPost, listComments } from '@/libs/Community';
import { getI18nPath } from '@/utils/Helpers';

type PostPageProps = {
  params: Promise<{ locale: string; category: string; postId: string }>;
};

export async function generateMetadata(props: PostPageProps): Promise<Metadata> {
  const { locale, postId } = await props.params;
  const post = await getPost({ id: postId });

  if (!post) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: 'CommunityPage' });
  const description = post.body.replaceAll(/\s+/gu, ' ').trim().slice(0, 160);

  return {
    title: t('post_meta_title', { title: post.title }),
    description,
    alternates: { canonical: getI18nPath(`/community/${post.category}/${post.id}`, locale) },
    openGraph: { title: post.title, description, type: 'article' },
  };
}

export default async function PostPage(props: PostPageProps) {
  const { locale, category, postId } = await props.params;
  setRequestLocale(locale);

  const { userId } = await auth();
  const post = await getPost({ id: postId, viewerId: userId ?? undefined });

  if (!post || post.category !== category) {
    notFound();
  }

  const comments = await listComments({ postId: post.id, viewerId: userId ?? undefined });

  return (
    <Section className="py-10 sm:py-16">
      <PostDetail
        locale={locale}
        basePath="/community"
        interactive={false}
        post={post}
        comments={comments}
        viewerId={userId ?? undefined}
      />
    </Section>
  );
}
