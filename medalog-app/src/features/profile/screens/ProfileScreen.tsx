import React from 'react';
import { ScrollView, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  ListRow,
  Screen,
  ScreenHeader,
  SectionLabel,
  StatGrid,
  Surface,
  Text,
  color,
  radius,
  space,
} from '../../../design';
import { APP_VERSION } from '../../../core/appInfo';
import { useSession } from '../../../core/session';
import { useNavigation } from '../../../navigation/Navigator';
import { authApi } from '../../auth/api';
import { usePendingCount, useRecords } from '../../capture/store';
import { syncNow, useSyncState } from '../../capture/sync';
import { useSignOut } from '../useSignOut';

/** The account tab: who you are, what is stashed, what still needs syncing. */
export function ProfileScreen() {
  const session = useSession();
  const nav = useNavigation();
  const { signOut, signingOut } = useSignOut();
  const { syncing, lastError } = useSyncState();
  const pending = usePendingCount();
  const records = useRecords();

  const me = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    staleTime: 60_000,
  });

  const name = me.data?.user.name?.trim() || session.email.split('@')[0] || 'You';
  const initial = name.charAt(0).toUpperCase();

  return (
    <Screen padded={false} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: space(4), paddingBottom: space(10) }}>
        <ScreenHeader title="Account" subtitle={session.email} />

        <Surface padding={4}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(3) }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: radius.pill,
                backgroundColor: color.accentSoft,
                borderWidth: 1,
                borderColor: color.accentBorder,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text variant="heading" tint={color.accent}>
                {initial}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="subheading" numberOfLines={1}>
                {name}
              </Text>
              <Text variant="caption" tone="muted" numberOfLines={1}>
                {me.data?.user.email || session.email}
              </Text>
            </View>
          </View>
        </Surface>

        <SectionLabel>OVERVIEW</SectionLabel>
        <StatGrid
          items={[
            { label: 'Stashed sessions', value: me.data?.stats?.sessions },
            { label: 'Stashed tabs', value: me.data?.stats?.tabs },
            { label: 'Captured records', value: records.length },
            { label: 'Waiting to sync', value: pending },
          ]}
        />

        <SectionLabel>CAPTURE SYNC</SectionLabel>
        <Surface padding={3.5}>
          <Text variant="bodyStrong">
            {pending === 0 ? 'Everything is on the server' : `${pending} item(s) queued on this device`}
          </Text>
          <Text variant="caption" tone="muted" style={{ marginTop: space(1) }}>
            Stamps are written locally first, so they survive being offline.
          </Text>
          {lastError ? (
            <Text variant="caption" tone="danger" style={{ marginTop: space(2) }} numberOfLines={2}>
              Last error: {lastError}
            </Text>
          ) : null}
          <View style={{ marginTop: space(3) }}>
            <Button
              label="Sync now"
              variant="secondary"
              size="sm"
              loading={syncing}
              onPress={() => void syncNow()}
            />
          </View>
        </Surface>

        <SectionLabel>APP</SectionLabel>
        <ListRow
          title="Settings"
          subtitle="Server URL, sync and sign out"
          onPress={() => nav.push({ name: 'settings' })}
        />
        <ListRow title="Version" meta={APP_VERSION} />

        <View style={{ marginTop: space(6) }}>
          <Button label="Sign out" variant="danger" block loading={signingOut} onPress={() => void signOut()} />
        </View>
      </ScrollView>
    </Screen>
  );
}
