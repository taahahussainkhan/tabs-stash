import React from 'react';
import { ScrollView, View } from 'react-native';
import {
  Badge,
  ErrorState,
  ListRow,
  Screen,
  ScreenHeader,
  SectionLabel,
  Spinner,
  Surface,
  Text,
  space,
} from '../../../design';
import { formatDate, formatRange } from '../../../core/format';
import { DetailHero, Facts } from '../components/DetailHero';
import { useMediaDetail } from '../hooks';
import {
  KIND_COLOR,
  KIND_LABEL,
  STATUS_TINT,
  statusLabel,
  type MediaKind,
} from '../types';

/** A movie or a series, with its history. One screen for both kinds. */
export function MediaDetailScreen({
  kind,
  id,
  onBack,
}: {
  kind: MediaKind;
  id: string;
  onBack: () => void;
}) {
  const query = useMediaDetail(kind, id);

  if (query.isPending) {
    return (
      <Screen padded={false}>
        <View style={{ paddingHorizontal: space(4) }}>
          <ScreenHeader title={KIND_LABEL[kind]} onBack={onBack} />
        </View>
        <Spinner label="Loading…" />
      </Screen>
    );
  }

  if (query.isError || !query.data) {
    return (
      <Screen padded={false}>
        <View style={{ paddingHorizontal: space(4) }}>
          <ScreenHeader title={KIND_LABEL[kind]} onBack={onBack} />
        </View>
        <ErrorState error={query.error} onRetry={query.refetch} />
      </Screen>
    );
  }

  const { item, sessions } = query.data;
  const progress =
    item.totalEpisodes && item.totalEpisodes > 0
      ? `${item.episodesWatched ?? 0} of ${item.totalEpisodes} episodes`
      : undefined;

  return (
    <Screen padded={false} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: space(4), paddingBottom: space(10) }}>
        <ScreenHeader
          title={KIND_LABEL[kind]}
          onBack={onBack}
          right={item.isFavorite ? <Text tint="#e0a33a" style={{ fontSize: 18 }}>★</Text> : undefined}
        />

        <DetailHero
          poster={item.poster}
          tint={KIND_COLOR[kind]}
          glyph={kind === 'movie' ? '▣' : '▤'}
          title={item.title}
          subtitle={item.creator}
          badges={
            <>
              <Badge label={statusLabel(item.status, kind)} tint={STATUS_TINT[item.status]} />
              {item.isWatchlist ? <Badge label="WATCHLIST" tint="#e0a33a" /> : null}
              {item.rewatchCount > 0 ? <Badge label={`REWATCH ${item.rewatchCount}`} tint="#2fb8a6" /> : null}
              {item.rating ? <Badge label={`★ ${item.rating}`} tint="#e0a33a" /> : null}
            </>
          }
          lines={[
            [item.year, item.genre].filter(Boolean).join(' · '),
            item.platform ? `On ${item.platform}` : '',
            progress ?? '',
          ]}
        />

        <SectionLabel>DETAILS</SectionLabel>
        <Facts
          items={[
            { label: 'Started', value: item.startedAt ? formatDate(item.startedAt) : null },
            { label: 'Finished', value: item.endedAt ? formatDate(item.endedAt) : null },
            { label: 'Sessions', value: sessions.length },
            { label: 'Rewatches', value: item.rewatchCount || null },
          ]}
        />

        {kind === 'series' && item.seasons?.length ? (
          <>
            <SectionLabel>{`SEASONS (${item.seasons.length})`}</SectionLabel>
            {item.seasons.map(season => (
              <ListRow
                key={`${season.seasonNumber}-${season.title ?? ''}`}
                title={season.title || `Season ${season.seasonNumber}`}
                subtitle={season.year ? String(season.year) : undefined}
                meta={`${season.episodeCount} ep`}
              />
            ))}
          </>
        ) : null}

        <SectionLabel>{`HISTORY (${sessions.length})`}</SectionLabel>
        {sessions.length ? (
          sessions
            .slice()
            .reverse()
            .map(session => (
              <ListRow
                key={session.id}
                accent={STATUS_TINT[session.status]}
                title={`${statusLabel(session.status, kind)}${session.isRewatch ? ' · rewatch' : ''}`}
                subtitle={formatRange(session.startedAt, session.endedAt)}
                meta={session.rating ? `★ ${session.rating}` : undefined}
                numberOfLines={1}
              />
            ))
        ) : (
          <Text variant="caption" tone="muted" style={{ marginBottom: space(2) }}>
            No sessions logged yet.
          </Text>
        )}

        {item.notes ? (
          <>
            <SectionLabel>NOTES</SectionLabel>
            <Surface padding={4}>
              <Text variant="body">{item.notes}</Text>
            </Surface>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
