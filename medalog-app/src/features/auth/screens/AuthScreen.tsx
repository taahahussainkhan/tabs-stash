import React, { useCallback, useState } from 'react';
import { Keyboard, Pressable, ScrollView, View } from 'react-native';
import {
  Button,
  Field,
  Row,
  Screen,
  Segmented,
  Stack,
  Text,
  color,
  radius,
  space,
} from '../../../design';
import { ApiError } from '../../../core/http';
import { DEFAULT_SERVER_URL, useSession, patchSession } from '../../../core/session';
import { authApi } from '../api';

type Mode = 'signin' | 'signup';

/**
 * Sign in / create account.
 *
 * The server URL lives here so a fresh install can be pointed at staging or a
 * LAN backend before the first sign-in; it is persisted with the session.
 */
export function AuthScreen() {
  const session = useSession();
  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState(session.email);
  const [password, setPassword] = useState('');
  const [serverUrl, setServerUrl] = useState(session.serverUrl || DEFAULT_SERVER_URL);
  const [advanced, setAdvanced] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async () => {
    Keyboard.dismiss();
    const mail = email.trim().toLowerCase();
    if (!mail || !password) {
      setError('Email and password are required.');
      return;
    }
    if (mode === 'signup' && password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      setError('Tell us your name so the account is yours.');
      return;
    }

    setError(null);
    setBusy(true);
    try {
      // the URL must be in place before the client builds the request
      const base = (serverUrl || DEFAULT_SERVER_URL).trim().replace(/\/+$/, '');
      await patchSession({ serverUrl: base });

      const tokens =
        mode === 'signin'
          ? await authApi.login(mail, password)
          : await authApi.register(name.trim(), mail, password);

      if (!tokens?.accessToken) throw new ApiError('The server did not return a session.', 500);

      await patchSession({
        email: mail,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken || '',
        serverUrl: base,
      });
    } catch (e: any) {
      setError(
        e instanceof ApiError && e.status === 0
          ? 'Cannot reach the server. Check the URL below.'
          : e?.message || 'Could not sign in.'
      );
    } finally {
      setBusy(false);
    }
  }, [email, mode, name, password, serverUrl]);

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerStyle={{ padding: space(6), paddingTop: space(16), flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: space(2), marginBottom: space(8) }}>
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: radius.lg,
              backgroundColor: color.accentSoft,
              borderWidth: 1,
              borderColor: color.accentBorder,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: space(2),
            }}
          >
            <Text style={{ fontSize: 24 }}>◈</Text>
          </View>
          <Text variant="display">MediaLog</Text>
          <Text variant="caption" tone="muted">
            Stamp what you watch and read. Every moment lands on every device.
          </Text>
        </View>

        <Segmented<Mode>
          options={[
            { value: 'signin', label: 'Sign in' },
            { value: 'signup', label: 'Create account' },
          ]}
          value={mode}
          onChange={next => {
            setMode(next);
            setError(null);
          }}
        />

        <Stack gap={3} style={{ marginTop: space(5) }}>
          {mode === 'signup' ? (
            <Field label="Name" placeholder="Your name" value={name} onChangeText={setName} autoCapitalize="words" />
          ) : null}
          <Field
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
          />
          <Field
            label="Password"
            placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            onSubmitEditing={submit}
            returnKeyType="go"
            error={error}
          />

          <Button
            label={mode === 'signin' ? 'Sign in' : 'Create account'}
            onPress={submit}
            loading={busy}
            block
            size="lg"
          />
        </Stack>

        <Pressable onPress={() => setAdvanced(v => !v)} style={{ marginTop: space(8) }} hitSlop={8}>
          <Row align="center" gap={2}>
            <Text variant="micro">{advanced ? '▾ SERVER' : '▸ SERVER'}</Text>
            <Text variant="caption" tone="faint" numberOfLines={1} style={{ flex: 1 }}>
              {serverUrl}
            </Text>
          </Row>
        </Pressable>

        {advanced ? (
          <Stack gap={2} style={{ marginTop: space(3) }}>
            <Field
              placeholder={DEFAULT_SERVER_URL}
              value={serverUrl}
              onChangeText={setServerUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              hint="Point the app at a local or staging API (…/api/v1)."
            />
          </Stack>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
