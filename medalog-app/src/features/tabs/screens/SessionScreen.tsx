import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import {
  Button,
  DataList,
  EmptyState,
  Screen,
  ScreenHeader,
  SectionLabel,
  Spinner,
  Text,
  space,
  useToast,
} from '../../../design';
import { formatDateTime, pluralize } from '../../../core/format';
import { openUrl } from '../../../core/link';
import { TabRow } from '../components/TabRow';
import { useSessions } from '../hooks';
import { sessionKey } from '../types';

/** How many tabs one tap may launch - more than this and the browser chokes. */
const OPEN_ALL_LIMIT = 20;

/**
 * The tabs of one stashed session, in the order they were open.
 *
 * Read-only by design: this screen exists so a session stashed on the desktop
 * can be resumed from the phone.
 */
export function SessionScreen({
  id,
  title,
  onBack,
}: {
  id: string;
  title: string;
  onBack: () => void;
}) {
  const query = useSessions();
  const toast = useToast();
  const [opening, setOpening] = useState(false);

  const session = query.data?.find(s => sessionKey(s) === id);

  const openAll = useCallback(async () => {
    if (!session?.tabs.length) return;
    const tabs = session.tabs.slice(0, OPEN_ALL_LIMIT);
    setOpening(true);
    try {
      for (const tab of tabs) {
        // sequential: one intent at a time, otherwise the launcher drops them
        await openUrl(tab.url);
      }
      toast.show(
        tabs.length < session.tabs.length
          ? `Opened the first ${tabs.length} of ${session.tabs.length} tabs.`
          : `Opened ${tabs.length} ${pluralize(tabs.length, 'tab')}.`,
        'success'
      );
    } finally {
      setOpening(false);
    }
  }, [session, toast]);

  if (query.isPending) {
    return (
      <Screen padded={false}>
        <View style={{ paddingHorizontal: space(4) }}>
          <ScreenHeader title={title} onBack={onBack} />
        </View>
        <Spinner label="Loading session…" />
      </Screen>
    );
  }

  if (!session) {
    return (
      <Screen padded={false}>
        <View style={{ paddingHorizontal: space(4) }}>
          <ScreenHeader title={title} onBack={onBack} />
        </View>
        <EmptyState
          glyph="∅"
          title="Session not found"
          message="It may have been removed from the dashboard or another device."
        />
      </Screen>
    );
  }

  const device = session.deviceInfo;

  return (
    <Screen padded={false} style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: space(4) }}>
        <ScreenHeader
          title={session.title || title}
          subtitle={`${formatDateTime(session.timestamp)}${
            device?.deviceName ? ` · ${device.deviceName}` : ''
          }`}
          onBack={onBack}
          right={
            <Button
              label="Open all"
              size="sm"
              variant="secondary"
              loading={opening}
              onPress={openAll}
              disabled={!session.tabs.length}
            />
          }
        />
      </View>

      <DataList
        data={session.tabs}
        keyExtractor={tab => tab.id ?? tab.url}
        header={
          <SectionLabel>
            {`${session.tabs.length} ${pluralize(session.tabs.length, 'TAB').toUpperCase()}`}
          </SectionLabel>
        }
        renderItem={tab => <TabRow tab={tab} />}
        empty={<EmptyState glyph="▢" title="This session has no tabs" message="Nothing was captured in it." />}
        footer={
          session.tabs.length > OPEN_ALL_LIMIT ? (
            <Text variant="caption" tone="faint" align="center" style={{ marginTop: space(2) }}>
              Open all launches the first {OPEN_ALL_LIMIT} tabs to keep the browser responsive.
            </Text>
          ) : null
        }
      />
    </Screen>
  );
}
