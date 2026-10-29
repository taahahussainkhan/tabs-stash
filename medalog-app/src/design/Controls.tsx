import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { Text } from './Text';
import { Stack } from './Layout';
import { color, radius, space, type } from './theme';

/* ----------------------------------------------------------------- buttons */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

const buttonBg: Record<ButtonVariant, string> = {
  primary: color.accent,
  secondary: 'transparent',
  ghost: 'transparent',
  danger: color.dangerSoft,
  success: color.successSoft,
};

const buttonBorder: Record<ButtonVariant, string> = {
  primary: color.accent,
  secondary: color.border,
  ghost: 'transparent',
  danger: color.dangerBorder,
  success: color.successBorder,
};

const buttonText: Record<ButtonVariant, string> = {
  primary: color.onAccent,
  secondary: color.text,
  ghost: color.textMuted,
  danger: color.danger,
  success: color.success,
};

const buttonPad: Record<ButtonSize, { v: number; h: number; font: number }> = {
  sm: { v: 8, h: 12, font: 13 },
  md: { v: 12, h: 18, font: 15 },
  lg: { v: 16, h: 22, font: 16 },
};

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  /** stretch to the container width */
  block?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  block,
  icon,
  style,
}: ButtonProps) {
  const inactive = disabled || loading;
  const pad = buttonPad[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
      style={({ pressed }) => [
        {
          backgroundColor: buttonBg[variant],
          borderColor: buttonBorder[variant],
          borderWidth: variant === 'ghost' ? 0 : 1,
          borderRadius: radius.md,
          paddingVertical: pad.v,
          paddingHorizontal: pad.h,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: space(2),
          opacity: inactive ? 0.5 : pressed ? 0.85 : 1,
        },
        block ? { width: '100%' } : null,
        style,
      ]}
    >
      {loading ? <ActivityIndicator size="small" color={buttonText[variant]} /> : icon}
      <Text style={{ color: buttonText[variant], fontSize: pad.font, fontWeight: '800' }} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

/* ------------------------------------------------------------------- chips */

export function Chip({
  label,
  active,
  onPress,
  tint = color.accent,
  size = 'md',
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  tint?: string;
  size?: 'sm' | 'md';
}) {
  const pad = size === 'sm' ? { v: space(1.5), h: space(3) } : { v: space(2.5), h: space(3.5) };
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      style={({ pressed }) => [
        {
          paddingVertical: pad.v,
          paddingHorizontal: pad.h,
          borderRadius: radius.pill,
          borderWidth: 1,
          borderColor: active ? tint : color.border,
          backgroundColor: active ? tint : color.surface,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text variant={size === 'sm' ? 'caption' : 'label'} tint={active ? color.onAccent : color.textMuted}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Badge({
  label,
  tint = color.accent,
  soft = true,
}: {
  label: string;
  tint?: string;
  soft?: boolean;
}) {
  return (
    <View
      style={{
        paddingHorizontal: space(2),
        paddingVertical: space(1),
        borderRadius: radius.sm,
        backgroundColor: soft ? 'rgba(255,255,255,0.08)' : tint,
      }}
    >
      <Text variant="micro" style={{ fontSize: 11, letterSpacing: 0.4 }} tint={soft ? tint : color.onAccent}>
        {label}
      </Text>
    </View>
  );
}

/* ------------------------------------------------------------------ inputs */

export interface FieldProps extends TextInputProps {
  label?: string;
  hint?: string;
  error?: string | null;
  /** left adornment (icon, "https://") */
  prefix?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

/** Label + input + error, so forms never restyle a raw TextInput. */
export function Field({ label, hint, error, prefix, containerStyle, style, ...rest }: FieldProps) {
  return (
    <View style={[{ gap: space(1.5) }, containerStyle]}>
      {label ? <Text variant="label">{label}</Text> : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space(2),
          backgroundColor: color.surface,
          borderWidth: 1,
          borderColor: error ? color.dangerBorder : color.border,
          borderRadius: radius.md,
          paddingHorizontal: space(3.5),
        }}
      >
        {prefix}
        <TextInput
          {...rest}
          placeholderTextColor={color.textFaint}
          style={[
            type.body,
            {
              flex: 1,
              paddingVertical: space(3),
              color: color.text,
              minHeight: 44,
            },
            style,
          ]}
        />
      </View>
      {error ? (
        <Text variant="caption" tone="danger">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" tone="faint">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

/* -------------------------------------------------------------- segmented */

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

/** Horizontal tab-like switch used inside a screen. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: color.surfaceAlt,
        borderRadius: radius.md,
        padding: 3,
        borderWidth: StyleSheet.hairlineWidth * 2,
        borderColor: color.border,
      }}
    >
      {options.map(option => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: space(2),
              borderRadius: radius.sm,
              backgroundColor: active ? color.surfaceHigh : 'transparent',
            }}
          >
            <Text variant="caption" tone={active ? 'default' : 'muted'} numberOfLines={1}>
              {option.count !== undefined ? `${option.label} ${option.count}` : option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ------------------------------------------------------------- touchable */

export function IconButton({
  glyph,
  onPress,
  label,
  active,
}: {
  glyph: string;
  onPress: () => void;
  label: string;
  active?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      android_ripple={{ color: 'rgba(255,255,255,0.08)', radius: 22 }}
      style={({ pressed }) => ({
        width: 38,
        height: 38,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: active ? color.accent : color.border,
        backgroundColor: color.surface,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Text style={{ fontSize: 17, color: active ? color.accent : color.text }}>{glyph}</Text>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ misc */

export function Spinner({ label }: { label?: string }) {
  return (
    <Stack align="center" justify="center" gap={3} style={{ paddingVertical: space(10) }}>
      <ActivityIndicator color={color.accent} />
      {label ? (
        <Text variant="caption" tone="muted">
          {label}
        </Text>
      ) : null}
    </Stack>
  );
}
