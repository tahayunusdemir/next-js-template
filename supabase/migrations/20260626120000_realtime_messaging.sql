-- Realtime messaging (chat) — SUPABASE ONLY.
--
-- This SQL must NOT run against local PGlite: it depends on Supabase's `realtime` schema
-- (`realtime.broadcast_changes`, `realtime.messages`, `realtime.topic`), which PGlite does not
-- have. It therefore lives outside the Drizzle pipeline in `migrations/` (which runs on both
-- PGlite and Supabase). Apply it to Supabase only — via the SQL Editor or `supabase db push`.
--
-- Architecture: a trigger on `public.message` broadcasts every change to the conversation's
-- private channel `conversation:<id>:messages`. The app keeps inserting messages through the
-- `pg` pool + Drizzle; the trigger handles the live push. Clients only ever subscribe (read).
-- See docs/cinepersona-docs/supabase-migration.md §6 and docs/official/supabase/.../broadcast.mdx.
--
-- Prerequisite (Dashboard): Project Settings → Realtime → disable "Allow public access" so the
-- private channels below are enforced; and configure Clerk as a Third-Party Auth provider so
-- `auth.jwt() ->> 'sub'` resolves to the Clerk user id. See migration guide §6.5–§6.6.

-- 1. Trigger function: broadcast message changes to the conversation's private topic.
create or replace function public.broadcast_message_changes()
returns trigger
security definer
set search_path = ''
language plpgsql
as $$
begin
  perform realtime.broadcast_changes(
    'conversation:' || coalesce(new.conversation_id, old.conversation_id)::text || ':messages', -- topic
    tg_op,           -- event (INSERT | UPDATE | DELETE)
    tg_op,           -- operation
    tg_table_name,   -- table
    tg_table_schema, -- schema
    new,             -- new record
    old              -- old record
  );
  return null;
end;
$$;

drop trigger if exists broadcast_message_changes_trigger on public.message;

create trigger broadcast_message_changes_trigger
after insert or update or delete on public.message
for each row
execute function public.broadcast_message_changes();

-- 2. Authorization: only members of a conversation may join (read) its broadcast channel.
-- Clerk user ids are NOT uuids, so compare against the `sub` claim as text — never auth.uid(),
-- which casts sub to uuid and errors. conversation_participant.user_id stores the Clerk id.

-- Let the connecting `authenticated` role see its own participation rows (needed both for the
-- realtime policy subquery below and as defense-in-depth if the table is ever exposed via the
-- data API). The app's pg pool connects as the table owner and bypasses RLS, so writes are
-- unaffected.
alter table public.conversation_participant enable row level security;

drop policy if exists "own conversation participation is readable" on public.conversation_participant;
create policy "own conversation participation is readable"
on public.conversation_participant
for select
to authenticated
using (user_id = (select auth.jwt() ->> 'sub'));

grant select on public.conversation_participant to authenticated;

-- Receive broadcasts only for conversations the user belongs to. Topic shape is
-- `conversation:<uuid>:messages`, so the 2nd ':'-segment is the conversation id.
drop policy if exists "conversation members can receive message broadcasts" on realtime.messages;
create policy "conversation members can receive message broadcasts"
on realtime.messages
for select
to authenticated
using (
  realtime.messages.extension = 'broadcast'
  and exists (
    select 1
    from public.conversation_participant cp
    where cp.user_id = (select auth.jwt() ->> 'sub')
      and cp.conversation_id = split_part((select realtime.topic()), ':', 2)::uuid
  )
);
