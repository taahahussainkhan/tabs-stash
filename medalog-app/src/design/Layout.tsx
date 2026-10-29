import React from 'react';
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';
import { color, radius, space } from './theme';
import { Text } from './Text';

/* ------------------------------------------------------------------ layout */

type StackProps = ViewProps & {
  /** gap in 4dp units */
  gap?: number;
  horizontal?: boolean;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  flex?: number;
  wrap?: boolean;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Flex container with a spacing gap - replaces ad-hoc margin soup. */
export function Stack({
  gap = 0,
  horizontal = false,
  align,
  justify,
  flex,
  wrap,
  padded,
  style,
  children,
  ...rest
}: StackProps) {
  return (
    <View
      {...rest}
      style={[
        { flexDirection: horizontal ? 'row' : 'column' },
        gap ? { gap: space(gap) } : null,
        align ? { alignItems: align } : null,
        justify ? { justifyContent: justify } : null,
        flex !== undefined ? { flex } : null,
        wrap ? { flexWrap: 'wrap' } : null,
        padded ? { padding: space(4) } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

export const Row = (props: Omit<StackProps, 'horizontal'>) => <Stack horizontal {...props} />;
export const Column = (props: Omit<StackProps, 'horizontal'>) => <Stack {...props} />;

/** Flexible spacer for pushing siblings apart. */
export const Spacer = ({ size = 0 }: { size?: number }) => (
  <View style={size ? { width: space(size), height: space(size) } : undefined} />
);

/* ----------------------------------------------------------------- surface */

type SurfaceProps = ViewProps & {
  /** 4dp padding step */
  padding?: number;
  tone?: 'default' | 'alt' | 'high' | 'transparent';
  rounded?: keyof typeof radius;
  bordered?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Surface({
  padding = 3,
  tone = 'default',
  rounded = 'lg',
  bordered = true,
  style,
  children,
  ...rest
}: SurfaceProps) {
  const bg =
    tone === 'alt' ? color.surfaceAlt : tone === 'high' ? color.surfaceHigh : tone === 'transparent' ? 'transparent' : color.surface;

  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: bg,
          borderRadius: radius[rounded],
          padding: space(padding),
          borderWidth: bordered ? StyleSheet.hairlineWidth * 2 : 0,
          borderColor: color.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Surface that behaves like a button (press feedback, ripple on Android). */
export function PressableSurface({
  onPress,
  disabled,
  style,
  children,
  ...rest
}: SurfaceProps & Pick<PressableProps, 'onPress' | 'disabled'>) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      android_ripple={{ color: 'rgba(255,255,255,0.06)' }}
      style={({ pressed }) => [pressed ? { opacity: 0.85 } : null]}
    >
      <Surface {...rest} style={style}>
        {children}
      </Surface>
    </Pressable>
  );
}

export function Divider({ inset = 0 }: { inset?: number }) {
  return <View style={{ height: 1, backgroundColor: color.border, marginHorizontal: space(inset) }} />;
}

/* ------------------------------------------------------------------ screen */

type ScreenProps = ViewProps & {
  /** disable horizontal padding for edge-to-edge content (lists keep it) */
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Plain full-bleed screen body. Safe areas are applied by the navigator. */
export function Screen({ padded = true, style, children, ...rest }: ScreenProps) {
  return (
    <View
      {...rest}
      style={[{ flex: 1, backgroundColor: color.bg, paddingHorizontal: padded ? space(4) : 0 }, style]}
    >
      {children}
    </View>
  );
}

/** Small uppercase section label, e.g. "LOGS (4)". */
export function SectionLabel({ children }: { children: string }) {
  return (
    <View style={{ marginTop: space(4), marginBottom: space(2) }}>
      <Text variant="micro">{children}</Text>
    </View>
  );
}
