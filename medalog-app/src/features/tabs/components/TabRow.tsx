import React from 'react';
import { ListRow, Text, Thumb, useToast, color } from '../../../design';
import { formatRelative } from '../../../core/format';
import { faviconFor, hostnameOf, openUrl } from '../../../core/link';
import type { TabItem } from '../types';

/** A single stashed tab. Tapping it re-opens the page in the browser. */
export function TabRow({ tab }: { tab: TabItem }) {
  const toast = useToast();
  const host = tab.hostname || hostnameOf(tab.url);

  return (
    <ListRow
      title={tab.title || host}
      subtitle={tab.stashedAt ? `${host} · ${formatRelative(tab.stashedAt)}` : host}
      leading={<Thumb uri={faviconFor(host)} glyph={host.charAt(0).toUpperCase()} size={34} />}
      trailing={<Text style={{ color: color.textFaint, fontSize: 20 }}>↗</Text>}
      onPress={async () => {
        const opened = await openUrl(tab.url);
        if (!opened) toast.show('Could not open that link.', 'danger');
      }}
    />
  );
}
