import { UserProfile } from '@clerk/nextjs';
import { setRequestLocale } from 'next-intl/server';
import { getI18nPath } from '@/utils/Helpers';

export default async function UserProfilePage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6">
      <div className="w-full max-w-5xl">
        <UserProfile
          path={getI18nPath('/dashboard/user-profile', locale)}
          appearance={{
            elements: {
              rootBox: 'w-full',
              cardBox: 'w-full max-w-none shadow-none',
            },
          }}
        />
      </div>
    </div>
  );
}
