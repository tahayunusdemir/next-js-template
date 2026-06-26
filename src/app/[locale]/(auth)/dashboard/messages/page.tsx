import { currentUser } from '@clerk/nextjs/server';
import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { ChatShell } from '@/components/chat/chat-shell';
import {
  getConversation,
  getOrCreateDirectConversation,
  listConversations,
  markRead,
} from '@/libs/Chat';
import { ensureProfile } from '@/libs/Profile';
import { getI18nPath } from '@/utils/Helpers';
import { ChatFilterValidation, ConversationIdValidation } from '@/validations/ChatValidation';

type DashboardMessagesPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Reads a single search param as a string, ignoring repeated/array values.
function readParam(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : undefined;
}

export default async function DashboardMessagesPage(props: DashboardMessagesPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const user = await currentUser();

  if (!user) {
    redirect(getI18nPath('/sign-in', locale));
  }

  // Make sure the signed-in user has a profile row so they can be addressed by others.
  await ensureProfile(user);

  const search = await props.searchParams;

  // `?to=<userId>` opens (or reuses) a direct thread, then redirects to its canonical url.
  const to = readParam(search.to);

  if (to) {
    const conversationId = await getOrCreateDirectConversation({ userId: user.id, targetId: to });
    redirect(
      getI18nPath(
        conversationId ? `/dashboard/messages?c=${conversationId}` : '/dashboard/messages',
        locale,
      ),
    );
  }

  const filter = ChatFilterValidation.safeParse(readParam(search.filter)).data ?? 'all';
  const selectedId = ConversationIdValidation.safeParse(readParam(search.c)).data ?? null;

  const detail = selectedId
    ? await getConversation({ userId: user.id, conversationId: selectedId })
    : null;

  // Opening a thread clears its unread count before the list is built, so the badge is fresh.
  if (detail) {
    await markRead({ userId: user.id, conversationId: detail.id });
  }

  const conversations = await listConversations({ userId: user.id, filter });

  return (
    <ChatShell
      conversations={conversations}
      detail={detail}
      filter={filter}
      currentUserId={user.id}
      locale={locale}
    />
  );
}
