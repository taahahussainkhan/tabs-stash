import React from 'react';
import { FlatList, View } from 'react-native';
import { SectionLabel, Text, space } from '../../../design';
import { HomeTile } from './HomeTile';
import type { DashboardItem } from '../types';

/**
 * A titled, horizontally scrolling row of titles.
 *
 * The three dashboard rows differ only by their title and data, so they share
 * this one component - the empty copy included.
 */
export function HomeStrip({
  title,
  items,
  emptyMessage,
  onPressItem,
}: {
  title: string;
  items: DashboardItem[];
  emptyMessage: string;
  onPressItem: (item: DashboardItem) => void;
}) {
  return (
    <View style={{ gap: space(2.5) }}>
      <View style={{ paddingHorizontal: space(4) }}>
        <SectionLabel>{title}</SectionLabel>
      </View>

      {items.length === 0 ? (
        <Text variant="caption" tone="faint" style={{ paddingHorizontal: space(4) }}>
          {emptyMessage}
        </Text>
      ) : (
        <FlatList
          horizontal
          data={items}
          keyExtractor={item => `${item.kind}-${item.id}`}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: space(4), gap: space(3) }}
          renderItem={({ item }) => (
            <HomeTile item={item} onPress={() => onPressItem(item)} />
          )}
        />
      )}
    </View>
  );
}
