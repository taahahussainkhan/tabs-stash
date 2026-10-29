import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { color, radius, space } from './theme';
import { Text } from './Text';

/**
 * The one list row used across the app: sessions, links, logs, episodes.
 *
 * It owns its own press feedback, leading slot, truncation and optional accent
 * bar, so no feature re-implements a row and they all line up vertically.
 */
export function ListRow({
  title,
  subtitle,
  meta,
  leading,
  trailing,
  accent,
  onPress,
  dim,
  numberOfLines = 1,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  /** 4dp-ish colour bar on the left */
  accent?: string;
  onPress?: () => void;
  dim?: boolean;
  numberOfLines?: number;
}) {
  const body = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space(3),
        backgroundColor: color.surface,
        borderWidth: 1,
        borderColor: color.border,
        borderRadius: radius.lg,
        paddingVertical: space(3),
        paddingHorizontal: space(3),
        opacity: dim ? 0.55 : 1,
      }}
    >
      {accent ? (
        <View style={{ width: 4, alignSelf: 'stretch', borderRadius: 2, backgroundColor: accent }} />
      ) : null}
      {leading}
      <View style={{ flex: 1, gap: space(1) }}>
        <Text variant="bodyStrong" numberOfLines={numberOfLines}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {meta ? (
        <Text variant="caption" tone="faint" numberOfLines={1}>
          {meta}
        </Text>
      ) : null}
      {trailing}
    </View>
  );

  if (!onPress) {
    return <View style={{ marginBottom: space(2) }}>{body}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      android_ripple={{ color: 'rgba(255,255,255,0.05)' }}
      style={({ pressed }) => ({ marginBottom: space(2), opacity: pressed ? 0.85 : 1 })}
    >
      {body}
    </Pressable>
  );
}

/** Square avatar/thumbnail slot with a graceful fallback glyph. */
export function Thumb({
  uri,
  size = 38,
  glyph,
  tint = color.accent,
}: {
  uri?: string;
  size?: number;
  glyph?: string;
  tint?: string;
}) {
  const [failed, setFailed] = React.useState(false);
  const showImage = !!uri && !failed;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius.sm,
        backgroundColor: color.surfaceHigh,
        borderWidth: 1,
        borderColor: color.border,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {showImage ? (
        <Image
          source={{ uri }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : glyph ? (
        <Text style={{ fontSize: size * 0.42, color: tint, fontWeight: '800' }}>{glyph}</Text>
      ) : null}
    </View>
  );
}
