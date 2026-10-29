import React from 'react';
import { View } from 'react-native';
import { Pressable } from 'react-native';
import { color, radius, space } from './theme';
import { Text } from './Text';

/**
 * Screen header. Every screen uses this instead of building its own row, so
 * back affordances and titles line up everywhere.
 */
export function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space(3),
        paddingVertical: space(3),
        minHeight: 52,
      }}
    >
      {onBack ? (
        <Pressable
          onPress={onBack}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={{
            width: 36,
            height: 36,
            borderRadius: radius.sm,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: color.surface,
            borderWidth: 1,
            borderColor: color.border,
          }}
        >
          <Text style={{ fontSize: 18, color: color.text, marginTop: -1 }}>‹</Text>
        </Pressable>
      ) : null}

      <View style={{ flex: 1 }}>
        <Text variant="title" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {right}
    </View>
  );
}
