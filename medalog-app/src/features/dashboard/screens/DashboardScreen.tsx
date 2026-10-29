import React, { useCallback } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  EmptyState,
  ErrorState,
  Screen,
  ScreenHeader,
  Spinner,
  StatGrid,
  Text,
  color,
  radius,
  space,
} from '../../../design';
import { formatDate } from '../../../core/format';
import { useSession } from '../../../core/session';
import { useNavigation } from '../../../navigation/Navigator';
import { HomeStrip } from '../components/HomeStrip';
import { useDashboard } from '../hooks';
import type { DashboardItem } from '../types';

/**
 * The home tab: the numbers first, then the three things you are most likely
 * to act on (continue, finished, saved for later).
 *
 * Everything comes from one cached `/dashboard` call; the counters inside it
 * are served by the server from its `user_stats` document, not recomputed.
 */
export function DashboardScreen() {
  const nav = useNavigation();
  const session = useSession();
  const insets = useSafeAreaInsets();
  const query = useDashboard();

  const open = useCallback(
    (item: DashboardItem) => {
      if (!item.id) return;
      if (item.kind === 'book') nav.push({ name: 'book', id: item.id });
      else if (item.kind === 'series') nav.push({ name: 'series', id: item.id });
      else nav.push({ name: 'movie', id: item.id });
    },
    [nav]
  );

  const stats = query.data?.stats;
  const name = session.email ? session.email.split('@')[0] : 'there';

  return (
    <Screen padded={false} style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: space(4) }}>
        <ScreenHeader
          title={`Hi, ${name}`}
          subtitle={formatDate(Date.now())}
        />
      </View>

      {query.isPending ? (
        <Spinner label="Pulling your library…" />
      ) : query.error && !query.data ? (
        <ErrorState error={query.error} onRetry={query.refetch} />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + space(24), gap: space(6) }}
          refreshControl={
            <RefreshControl
              refreshing={query.isRefetching}
              onRefresh={() => void query.refetch()}
              tintColor={color.accent}
              colors={[color.accent]}
              progressBackgroundColor={color.surface}
            />
          }
        >
          <View style={{ paddingHorizontal: space(4) }}>
            <StatGrid
              columns={3}
              items={[
                { label: 'Movies', value: stats?.total_movies },
                { label: 'Series', value: stats?.total_series },
                { label: 'Books', value: stats?.total_books },
                { label: 'Sessions', value: stats?.total_stashed_tabs },
                { label: 'Watching', value: stats?.watching },
                { label: 'Completed', value: stats?.completed },
              ]}
            />
          </View>

          <View style={{ paddingHorizontal: space(4) }}>
            <View
              style={{
                backgroundColor: color.accentSoft,
                borderColor: color.accentBorder,
                borderWidth: 1,
                borderRadius: radius.lg,
                padding: space(4),
                flexDirection: 'row',
                alignItems: 'center',
                gap: space(4),
              }}
            >
              <Text style={{ fontSize: 30, color: color.accent }}>{stats?.completed_this_month ?? 0}</Text>
              <View style={{ flex: 1 }}>
                <Text variant="label">Finished this month</Text>
                <Text variant="caption" tone="muted">
                  {stats?.watchlist ?? 0} waiting on the watchlist
                  {stats?.reading ? ` · ${stats.reading} reading` : ''}
                </Text>
              </View>
            </View>
          </View>

          <HomeStrip
            title="Continue"
            items={query.data?.continue_watching ?? []}
            emptyMessage="Nothing in progress. Start something from the library."
            onPressItem={open}
          />

          <HomeStrip
            title="Recently finished"
            items={query.data?.recently_completed ?? []}
            emptyMessage="Finished titles show up here."
            onPressItem={open}
          />

          <HomeStrip
            title="Watchlist"
            items={query.data?.watchlist_preview ?? []}
            emptyMessage="Add something to the watchlist from the web app."
            onPressItem={open}
          />

          {stats &&
          !query.data?.continue_watching.length &&
          !query.data?.recently_completed.length &&
          !query.data?.watchlist_preview.length ? (
            <View style={{ paddingHorizontal: space(4) }}>
              <EmptyState
                glyph="◈"
                title="Your archive is empty"
                message="Log a movie in the web dashboard, or capture one from the Capture tab, and it all shows up here."
              />
            </View>
          ) : null}
        </ScrollView>
      )}
    </Screen>
  );
}
