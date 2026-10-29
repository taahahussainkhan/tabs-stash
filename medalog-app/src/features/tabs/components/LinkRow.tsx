import React from 'react';
import { Pressable } from 'react-native';
import { ListRow, Text, Thumb, color, space, useToast } from '../../../design';
import { formatRelative } from '../../../core/format';
import { faviconFor, hostnameOf, openUrl } from '../../../core/link';
import type { SavedLink } from '../types';

/**
 * A saved link from the reading shelf.
 *
 * Tapping opens the page; the trailing control flips read/unread without
 * leaving the screen (the web shelf has the same affordance).
 */
export function LinkRow({
  link,
  onToggleRead,
}: {
  link: SavedLink;
  onToggleRead: (isRead: boolean) => void;
}) {
  const toast = useToast();
  const host = link.hostname || hostnameOf(link.url);
  const unread = !link.isRead;

  return (
    <ListRow
      title={link.title || host}
      subtitle={`${host} · ${formatRelative(link.savedAt)}`}
      accent={unread ? color.accent : undefined}
      dim={!unread}
      leading={<Thumb uri={faviconFor(host)} glyph={host.charAt(0).toUpperCase()} size={34} />}
      trailing={
        <Pressable
          onPress={() => onToggleRead(unread)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={unread ? 'Mark as read' : 'Mark as unread'}
          android_ripple={{ color: 'rgba(255,255,255,0.1)', radius: 18 }}
          style={{ padding: space(1.5) }}
        >
          <Text style={{ fontSize: 16, color: unread ? color.accent : color.textFaint }}>
            {unread ? '○' : '✓'}
          </Text>
        </Pressable>
      }
      onPress={async () => {
        const opened = await openUrl(link.url);
        if (!opened) toast.show('Could not open that link.', 'danger');
      }}
    />
  );
}
