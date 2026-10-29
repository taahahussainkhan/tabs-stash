import React from 'react';
import { Pressable, View } from 'react-native';
import { Badge, Row, Stack, Text, color, space } from '../../../design';
import { formatRelative, pluralize } from '../../../core/format';
import { MEDIA_COLOR, MEDIA_LABEL, type QuickRecord } from '../types';

/** One captured record in the list. Used by Capture and by the record picker. */
export function RecordRow({
  record,
  onPress,
  pending,
}: {
  record: QuickRecord;
  onPress: () => void;
  pending?: number;
}) {
  const dissolved = record.status === 'dissolved';
  const tint = MEDIA_COLOR[record.mediaType];
  const last = record.logs[0];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      android_ripple={{ color: 'rgba(255,255,255,0.05)' }}
      style={({ pressed }) => ({
        backgroundColor: color.surface,
        borderColor: color.border,
        borderWidth: 1,
        borderRadius: 16,
        padding: space(3.5),
        marginBottom: space(2.5),
        opacity: pressed ? 0.9 : dissolved ? 0.55 : 1,
      })}
    >
      <Row align="center" gap={3}>
        <View style={{ width: 4, alignSelf: 'stretch', borderRadius: 2, backgroundColor: tint }} />
        <Stack flex={1} gap={1}>
          <Row align="center" gap={2}>
            <Text variant="subheading" numberOfLines={1} style={{ flexShrink: 1 }}>
              {record.title}
            </Text>
            {dissolved ? <Badge label="DISSOLVED" tint={color.danger} /> : null}
          </Row>
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {MEDIA_LABEL[record.mediaType]} · {record.logs.length} {pluralize(record.logs.length, 'log')}
            {last ? ` · ${formatRelative(last.stampedAt)}` : ''}
          </Text>
        </Stack>
        {pending ? <Text style={{ color: color.warning, fontSize: 16 }}>•</Text> : null}
        <Text style={{ color: color.textFaint, fontSize: 22 }}>›</Text>
      </Row>
    </Pressable>
  );
}
