import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Text, color, radius, space } from '../design';
import { isSignedIn, loadSession, useSession } from '../core/session';
import { Navigator } from '../navigation/Navigator';
import type { RouteName, TabKey } from '../navigation/types';
import { AuthScreen } from '../features/auth';
import { CaptureScreen, RecordScreen, loadRecords, useAutoSync } from '../features/capture';
import { DashboardScreen } from '../features/dashboard';
import { BookDetailScreen, LibraryScreen, MediaDetailScreen } from '../features/library';
import { ProfileScreen, SettingsScreen } from '../features/profile';
import { SessionScreen, TabsScreen } from '../features/tabs';

/**
 * The app shell.
 *
 * Everything is injected into the navigator through these two registries, so a
 * feature only has to export a screen to become reachable - navigation itself
 * never imports a feature, and features never import each other.
 */
const TAB_SCREENS: Record<TabKey, React.ComponentType> = {
  home: DashboardScreen,
  capture: CaptureScreen,
  tabs: TabsScreen,
  library: LibraryScreen,
  profile: ProfileScreen,
};

function MovieRoute({ id, onBack }: { id: string; onBack: () => void }) {
  return <MediaDetailScreen kind="movie" id={id} onBack={onBack} />;
}

function SeriesRoute({ id, onBack }: { id: string; onBack: () => void }) {
  return <MediaDetailScreen kind="series" id={id} onBack={onBack} />;
}

const ROUTE_SCREENS: Record<RouteName, React.ComponentType<any>> = {
  record: RecordScreen,
  session: SessionScreen,
  movie: MovieRoute,
  series: SeriesRoute,
  book: BookDetailScreen,
  settings: SettingsScreen,
};

export function Root() {
  const session = useSession();
  const [ready, setReady] = useState(false);

  // hydrate the session and the offline queue before deciding what to show
  useEffect(() => {
    let alive = true;
    (async () => {
      await Promise.all([loadSession(), loadRecords()]);
      if (alive) setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (!ready) return <Splash />;
  if (!isSignedIn(session)) return <AuthScreen />;
  return <SignedIn />;
}

function SignedIn() {
  // one sync when the account becomes available; the rest is driven by edits
  useAutoSync();
  return <Navigator tabs={TAB_SCREENS} routes={ROUTE_SCREENS} />;
}

function Splash() {
  return (
    <View style={{ flex: 1, backgroundColor: color.bg, alignItems: 'center', justifyContent: 'center', gap: space(4) }}>
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: radius.lg,
          backgroundColor: color.accentSoft,
          borderWidth: 1,
          borderColor: color.accentBorder,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 26 }}>◈</Text>
      </View>
      <ActivityIndicator color={color.accent} />
    </View>
  );
}
