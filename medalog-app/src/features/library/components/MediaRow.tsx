import React from 'react';
import { Pressable, View } from 'react-native';
import { Badge, Poster, Row, Stack, Text, color, radius, space } from '../../../design';
import { KIND_COLOR, STATUS_TINT, statusLabel, type MediaItem } from '../types';

/** One movie or series in the library list. */
export function MediaRow({ item, onPress }: { item: MediaItem; onPress: () => void }) {
  const facts = [item.creator, item.year ? String(item.year) : undefined, item.genre]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={item.title}
      android_ripple={{ color: 'rgba(255,255,255,0.05)' }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: space(3),
        backgroundColor: color.surface,
        borderColor: color.border,
        borderWidth: 1,
        borderRadius: radius.lg,
        padding: space(2.5),
        marginBottom: space(2),
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <Poster
        uri={item.poster}
        width={44}
        height={66}
        tint={KIND_COLOR[item.kind]}
        glyph={item.kind === 'movie' ? '▣' : '▤'}
      />

      <Stack flex={1} gap={1}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {item.title}
        </Text>
        {facts ? (
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {facts}
          </Text>
        ) : null}
        <Row align="center" gap={2} style={{ marginTop: space(1) }}>
          <Badge label={statusLabel(item.status, item.kind)} tint={STATUS_TINT[item.status]} />
          {item.kind === 'series' && item.totalEpisodes ? (
            <Text variant="caption" tone="faint">
              {item.episodesWatched ?? 0}/{item.totalEpisodes} ep
            </Text>
          ) : null}
          {item.rating ? (
            <Text variant="caption" tone="faint">
              ★ {item.rating}
            </Text>
          ) : null}
          {item.isWatchlist ? (
            <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: color.warning }} />
          ) : null}
        </Row>
      </Stack>

      <Text style={{ color: color.textFaint, fontSize: 20 }}>›</Text>
    </Pressable>
  );
}
