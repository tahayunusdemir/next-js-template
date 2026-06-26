'use client';

import { useSession } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';
import { getSupabaseBrowserClient, setClerkTokenGetter } from '@/libs/SupabaseClient';

// Realtime seam for messages. Subscribes to the conversation's private Broadcast channel and
// calls `onMessage` whenever a row changes in the `message` table — a Postgres trigger
// (supabase/migrations/*_realtime_messaging.sql) broadcasts via `realtime.broadcast_changes`,
// so our server-action insert path stays untouched and the client only ever reads.
//
// Broadcast (not postgres_changes) per docs/cinepersona-docs/supabase-migration.md §6.2. When
// Supabase env is absent (local PGlite dev) this is a no-op and the thread re-renders from the
// server after each send, exactly as before.
export function useConversationRealtime(props: { conversationId: string; onMessage: () => void }) {
  const { session } = useSession();

  // Always call the latest handler without resubscribing when the parent re-renders.
  const onMessageRef = useRef(props.onMessage);
  onMessageRef.current = props.onMessage;

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    if (!(supabase && session)) {
      // No Supabase (local PGlite dev) → no cleanup; the explicit value satisfies consistent-return.
      // oxlint-disable-next-line unicorn/no-useless-undefined
      return undefined;
    }

    setClerkTokenGetter(async () => await session.getToken());

    let active = true;
    const channel = supabase.channel(`conversation:${props.conversationId}:messages`, {
      config: { private: true },
    });

    const subscribe = async () => {
      // DB broadcasts are private by default, so the Clerk token must be attached before joining.
      await supabase.realtime.setAuth();

      if (!active) {
        return;
      }

      channel
        .on('broadcast', { event: 'INSERT' }, () => {
          onMessageRef.current();
        })
        .on('broadcast', { event: 'UPDATE' }, () => {
          onMessageRef.current();
        })
        .on('broadcast', { event: 'DELETE' }, () => {
          onMessageRef.current();
        })
        .subscribe();
    };

    void subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [props.conversationId, session]);
}
