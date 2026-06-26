import { getTranslations } from 'next-intl/server';
import { ConnectionRow } from '@/components/profile/connection-row';
import { ProfileEmpty } from '@/components/profile/profile-empty';
import type { Connection } from '@/libs/Social';

// Renders a connections list, or a quiet empty state. `renderActions` supplies the
// per-row action node (the follow/block button); omit it for read-only public lists.
// Translations resolve once here, not per row.
export async function ConnectionList(props: {
  items: Connection[];
  locale: string;
  emptyMessage: string;
  renderActions?: (connection: Connection) => React.ReactNode;
}) {
  if (props.items.length === 0) {
    return <ProfileEmpty message={props.emptyMessage} />;
  }

  const t = await getTranslations({ locale: props.locale, namespace: 'ProfilePage' });

  return (
    <ul className="divide-y divide-border">
      {props.items.map((connection) => (
        <li key={connection.id}>
          <ConnectionRow
            connection={connection}
            meta={t('connection_meta', {
              followers: connection.followers,
              following: connection.following,
            })}
            actions={props.renderActions?.(connection)}
          />
        </li>
      ))}
    </ul>
  );
}
