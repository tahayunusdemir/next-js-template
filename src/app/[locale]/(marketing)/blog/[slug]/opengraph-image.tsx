import { ImageResponse } from 'next/og';
import { getAllSlugs, getPostBySlug } from '@/libs/Blog';
import { AppConfig } from '@/utils/AppConfig';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = AppConfig.name;

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export default async function OpengraphImage(props: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await props.params;
  const post = getPostBySlug(slug);
  const content = post?.content[locale];

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '80px',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        color: '#fafafa',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: '#fafafa',
            color: '#0a0a0a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '34px',
          }}
        >
          ✦
        </div>
        <div style={{ fontSize: '32px', fontWeight: 600 }}>{AppConfig.name}</div>
      </div>

      <div
        style={{
          fontSize: '68px',
          fontWeight: 700,
          lineHeight: 1.05,
          letterSpacing: '-0.03em',
          maxWidth: '960px',
        }}
      >
        {content?.title ?? AppConfig.name}
      </div>

      <div style={{ fontSize: '28px', color: '#a1a1a1', maxWidth: '900px' }}>
        {content?.description ?? ''}
      </div>
    </div>,
    { ...size },
  );
}
