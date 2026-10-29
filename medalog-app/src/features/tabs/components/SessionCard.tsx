import React from 'react';
import { Pressable, View } from 'react-native';
import { Badge, Row, Text, color, radius, space } from '../../../design';
import { formatRelative, pluralize } from '../../../core/format';
import { hostnameOf } from '../../../core/link';
import type { StashedSession } from '../types';

/** One stashed session: where it came from, how big it is, when it happened. */
export function SessionCard({
  session,
  onPress,
}: {
  session: StashedSession;
  onPress: () => void;
}) {
  const tabs = session.tabs ?? [];
  const hosts = Array.from(
    new Set(tabs.map(t => t.hostname || hostnameOf(t.url)).filter(Boolean))
  ).slice(0, 3);
  const device = session.deviceInfo?.deviceName || session.deviceInfo?.platform;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${session.title}, ${tabs.length} tabs`}
      android_ripple={{ color: 'rgba(255,255,255,0.05)' }}
      style={({ pressed }) => ({
        backgroundColor: color.surface,
        borderColor: color.border,
        borderWidth: 1,
        borderRadius: radius.lg,
        padding: space(3.5),
        marginBottom: space(2.5),
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <Row align="center" gap={2} style={{ marginBottom: space(2) }}>
        <Text variant="subheading" numberOfLines={1} style={{ flexShrink: 1 }}>
          {session.title || 'Untitled session'}
        </Text>
        {session.isPinned ? <Badge label="PINNED" tint={color.accent} /> : null}
      </Row>

      <Row align="center" gap={2}>
        <Text variant="caption" tone="muted">
          {tabs.length} {pluralize(tabs.length, 'tab')} · {formatRelative(session.timestamp)}
        </Text>
        <View style={{ flex: 1 }} />
        <Text style={{ color: color.textFaint, fontSize: 20 }}>›</Text>
      </Row>

      {hosts.length || device ? (
        <Row align="center" gap={2} wrap style={{ marginTop: space(2.5) }}>
          {hosts.map(host => (
            <View
              key={host}
              style={{
                paddingHorizontal: space(2),
                paddingVertical: space(1),
                borderRadius: radius.sm,
                backgroundColor: color.surfaceAlt,
                borderWidth: 1,
                borderColor: color.border,
              }}
            >
              <Text variant="caption" tone="faint" numberOfLines={1}>
                {host}
              </Text>
            </View>
          ))}
          {device ? (
            <Text variant="caption" tone="faint" numberOfLines={1}>
              {device}
            </Text>
          ) : null}
        </Row>
      ) : null}
    </Pressable>
  );
}
