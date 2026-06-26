'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { createPostAction } from '@/app/[locale]/(marketing)/community/actions';
import { useCommunityAction } from '@/components/community/use-community-action';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { COMMUNITY_CATEGORIES, DEFAULT_COMMUNITY_CATEGORY } from '@/data/community-categories';
import { COMMUNITY_CATEGORY_SLUGS } from '@/types/Community';
import type { CommunityCategorySlug } from '@/types/Community';
import { POST_BODY_MAX, POST_TITLE_MAX, POST_TITLE_MIN } from '@/validations/CommunityValidation';

// New-post form: category + title + body. On success it routes to the created post; anon
// users are sent to sign-in.
export function PostComposer(props: { defaultCategory?: CommunityCategorySlug }) {
  const { t, router, basePath, guard, onFailure } = useCommunityAction();
  const [category, setCategory] = React.useState<CommunityCategorySlug>(
    props.defaultCategory ?? DEFAULT_COMMUNITY_CATEGORY,
  );
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');
  const [pending, setPending] = React.useState(false);

  async function submit() {
    if (!guard()) {
      return;
    }

    setPending(true);
    const result = await createPostAction({ category, title, body });
    setPending(false);

    if (result.ok) {
      toast.success(t('post_created'));
      router.push(`${basePath}/${category}/${result.postId}`);
    } else {
      onFailure(result.reason);
    }
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="post-category">{t('category_label')}</Label>
        <NativeSelect
          id="post-category"
          value={category}
          onChange={(event) => {
            const next = COMMUNITY_CATEGORY_SLUGS.find((slug) => slug === event.target.value);

            if (next) {
              setCategory(next);
            }
          }}
        >
          {COMMUNITY_CATEGORIES.map((item) => (
            <NativeSelectOption key={item.slug} value={item.slug}>
              {t(`category_${item.slug}_name`)}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="post-title">{t('title_label')}</Label>
        <Input
          id="post-title"
          required
          maxLength={POST_TITLE_MAX}
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
          }}
          placeholder={t('title_placeholder')}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="post-body">{t('body_label')}</Label>
        <Textarea
          id="post-body"
          required
          maxLength={POST_BODY_MAX}
          value={body}
          onChange={(event) => {
            setBody(event.target.value);
          }}
          placeholder={t('body_placeholder')}
          className="min-h-40 resize-y"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            router.back();
          }}
        >
          {t('cancel')}
        </Button>
        <Button
          type="submit"
          disabled={pending || title.trim().length < POST_TITLE_MIN || body.trim().length === 0}
        >
          {pending ? t('posting') : t('post_submit')}
        </Button>
      </div>
    </form>
  );
}
