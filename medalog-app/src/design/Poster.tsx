import React, { useState } from 'react';
import { Image, View } from 'react-native';
import { Text } from './Text';
import { color, radius } from './theme';

/**
 * Cover art slot with a typographic fallback.
 *
 * Used for posters, thumbnails and dashboard strips alike - any place that
 * shows an image that may be missing or fail to load, so no screen has to
 * re-implement the fallback.
 */
export function Poster({
  uri,
  width,
  height,
  tint = color.accent,
  glyph = '▤',
  radiusSize = 'md',
}: {
  uri?: string;
  width: number;
  height: number;
  tint?: string;
  glyph?: string;
  radiusSize?: keyof typeof radius;
}) {
  const [failed, setFailed] = useState(false);
  const show = !!uri && !failed;

  return (
    <View
      style={{
        width,
        height,
        borderRadius: radius[radiusSize],
        overflow: 'hidden',
        backgroundColor: color.surfaceHigh,
        borderWidth: 1,
        borderColor: color.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {show ? (
        <Image
          source={{ uri }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <Text style={{ fontSize: width * 0.38, color: tint, fontWeight: '800' }}>{glyph}</Text>
      )}
    </View>
  );
}
