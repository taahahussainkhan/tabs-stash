import React from 'react';
import { Pressable, View } from 'react-native';
import { Poster, Text, color, radius, space } from '../../../design';
import { KIND_GLYPH, KIND_TINT, type DashboardItem } from '../types';

const TILE_WIDTH = 118;

/** One title in a dashboard strip: cover, title, and the line that matters. */
export function HomeTile({
  item,
  onPress,
}: {
  item: DashboardItem;
  onPress: () => void;
}) {
  const meta =
    item.authorOrDirector || item.year
      ? [item.authorOrDirector, item.year].filter(Boolean).join(' · ')
      : item.genre || null;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={item.title}
      style={({ pressed }) => ({ width: TILE_WIDTH, opacity: pressed ? 0.85 : 1 })}
    >
      <Poster
        uri={item.posterUrl ?? undefined}
        title={item.title}
        tint={KIND_TINT[item.kind]}
        width={TILE_WIDTH}
        height={Math.round(TILE_WIDTH * 1.45)}
        glyph={KIND_GLYPH[item.kind]}
        radiusSize="md"
      />

      <Text variant="label" numberOfLines={2} style={{ marginTop: space(2) }}>
        {item.title}
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(1.5) }}>
        {item.rating ? (
          <Text variant="caption" tint={color.warning}>
            ★ {item.rating}
          </Text>
        ) : null}
        {meta ? (
          <Text variant="caption" tone="faint" numberOfLines={1} style={{ flex: 1 }}>
            {meta}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

/** Shared tile metrics so strips and the detail hero stay aligned. */
export const HOME_TILE = { width: TILE_WIDTH, gap: space(3), radius: radius.md };
