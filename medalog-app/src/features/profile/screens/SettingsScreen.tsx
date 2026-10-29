import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Field,
  ListRow,
  Screen,
  ScreenHeader,
  SectionLabel,
  Surface,
  Text,
  space,
  useToast,
} from '../../../design';
import { APP_VERSION } from '../../../core/appInfo';
import { DEFAULT_SERVER_URL, clearSession, patchSession, useSession } from '../../../core/session';
import { usePendingCount } from '../../capture/store';
import { syncNow, useSyncState } from '../../capture/sync';
import { useSignOut } from '../useSignOut';

/** Settings: which API this device talks to, and the account escape hatches. */
export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const session = useSession();
  const toast = useToast();
  const client = useQueryClient();
  const { signOut, signingOut } = useSignOut();
  const { syncing, lastError } = useSyncState();
  const pending = usePendingCount();

  const [url, setUrl] = useState(session.serverUrl);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const next = url.trim().replace(/\/+$/, '');
    if (!/^https?:\/\//.test(next)) {
      toast.show('The URL must start with http:// or https://.', 'danger');
      return;
    }
    if (next === session.serverUrl) {
      toast.show('That is already the server.');
      return;
    }

    setSaving(true);
    try {
      await patchSession({ serverUrl: next });
      // tokens are issued per server, and every cached response is stale now
      client.clear();
      await clearSession();
      toast.show('Server changed. Sign in again.', 'success');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen padded={false} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: space(4), paddingBottom: space(10) }}>
        <ScreenHeader title="Settings" subtitle={session.email} onBack={onBack} />

        <SectionLabel>SERVER</SectionLabel>
        <Field
          label="API base URL"
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          hint="Changing the server signs you out, because tokens are issued per server."
        />
        <View style={{ height: space(3) }} />
        <View style={{ flexDirection: 'row', gap: space(2) }}>
          <Button label="Save server" size="sm" loading={saving} onPress={save} />
          <Button
            label="Use default"
            size="sm"
            variant="secondary"
            onPress={() => setUrl(DEFAULT_SERVER_URL)}
          />
        </View>

        <SectionLabel>SYNC</SectionLabel>
        <Surface padding={3.5}>
          <Text variant="bodyStrong">
            {pending === 0 ? 'Nothing waiting' : `${pending} item(s) waiting to reach the server`}
          </Text>
          {lastError ? (
            <Text variant="caption" tone="danger" style={{ marginTop: space(1) }} numberOfLines={2}>
              {lastError}
            </Text>
          ) : (
            <Text variant="caption" tone="muted" style={{ marginTop: space(1) }}>
              Captures are stamped on the device and replayed when the server is reachable.
            </Text>
          )}
          <View style={{ marginTop: space(3) }}>
            <Button label="Sync now" size="sm" variant="secondary" loading={syncing} onPress={() => void syncNow()} />
          </View>
        </Surface>

        <SectionLabel>ACCOUNT</SectionLabel>
        <ListRow title="Email" meta={session.email} />
        <ListRow title="Version" meta={APP_VERSION} />
        <ListRow
          title="Design language"
          subtitle="Shared with the web dashboard and the extension"
          meta="v1"
        />

        <View style={{ marginTop: space(6) }}>
          <Button label="Sign out" variant="danger" block loading={signingOut} onPress={() => void signOut()} />
          <Text variant="caption" tone="faint" align="center" style={{ marginTop: space(3) }}>
            Signing out also clears the local capture queue and cached data.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
