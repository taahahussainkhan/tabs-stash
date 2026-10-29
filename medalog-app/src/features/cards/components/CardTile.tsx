import React from 'react';
import { Pressable, View } from 'react-native';
import { Row, Text, color, radius, space } from '../../../design';
import { formatRelative } from '../../../core/format';
import { cardHeading, cardTint, type CardItem } from '../types';

/** A quick card (note). Tapping opens the full text in a sheet. */
export function CardTile({ card, onPress }: { card: CardItem; onPress: () => void }) {
  const tint = cardTint(card.color);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={cardHeading(card)}
      android_ripple={{ color: 'rgba(255,255,255,0.05)' }}
      style={({ pressed }) => ({
        backgroundColor: tint.bg,
        borderColor: tint.border,
        borderWidth: 1,
        borderRadius: radius.lg,
        padding: space(3.5),
        marginBottom: space(2.5),
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <Row align="center" gap={2}>
        <Text variant="subheading" numberOfLines={1} style={{ flex: 1 }}>
          {cardHeading(card)}
        </Text>
        {card.isPinned ? <Text style={{ color: color.accent, fontSize: 13 }}>◆</Text> : null}
      </Row>

      <Text variant="caption" tone="muted" numberOfLines={4} style={{ marginTop: space(2) }}>
        {card.content}
      </Text>

      <View style={{ flex: 1 }} />

      <Row align="center" gap={2} style={{ marginTop: space(3) }}>
        {card.tags?.slice(0, 2).map(tag => (
          <Text key={tag} variant="caption" tone="faint" numberOfLines={1}>
            #{tag}
          </Text>
        ))}
        <View style={{ flex: 1 }} />
        <Text variant="caption" tone="faint">
          {formatRelative(card.savedAt)}
        </Text>
      </Row>
    </Pressable>
  );
}
