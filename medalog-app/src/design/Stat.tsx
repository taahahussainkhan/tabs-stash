import React from 'react';
import { View } from 'react-native';
import { Text } from './Text';
import { color, radius, space } from './theme';

/**
 * Label/value tiles. Used for account counters and for metadata grids on detail
 * screens, so numbers and facts always look the same.
 */
export function StatGrid({
  items,
  columns = 2,
}: {
  items: Array<{ label: string; value?: string | number | null }>;
  columns?: 2 | 3;
}) {
  const present = items.filter(
    item => item.value !== undefined && item.value !== null && `${item.value}`.trim() !== ''
  );
  if (!present.length) return null;

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space(2) }}>
      {present.map(item => (
        <View
          key={item.label}
          style={{
            flexGrow: 1,
            flexBasis: columns === 3 ? '29%' : '44%',
            backgroundColor: color.surface,
            borderWidth: 1,
            borderColor: color.border,
            borderRadius: radius.md,
            padding: space(3),
          }}
        >
          <Text variant="micro">{item.label.toUpperCase()}</Text>
          <Text variant="bodyStrong" numberOfLines={2} style={{ marginTop: space(1) }}>
            {String(item.value)}
          </Text>
        </View>
      ))}
    </View>
  );
}
