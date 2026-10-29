import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { color, type } from './theme';

export type TextVariant = keyof typeof type;
export type TextTone = 'default' | 'muted' | 'faint' | 'accent' | 'danger' | 'success' | 'warning' | 'onAccent';

const toneColor: Record<TextTone, string | undefined> = {
  default: undefined,
  muted: color.textMuted,
  faint: color.textFaint,
  accent: color.accent,
  danger: color.danger,
  success: color.success,
  warning: color.warning,
  onAccent: color.onAccent,
};

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  tone?: TextTone;
  /** shorthand for textAlign */
  align?: TextStyle['textAlign'];
  /** colour override for media types, badges, etc. */
  tint?: string;
}

/** Typographic primitive: every string in the app goes through here. */
export function Text({
  variant = 'body',
  tone = 'default',
  align,
  tint,
  style,
  ...rest
}: TextProps) {
  return (
    <RNText
      {...rest}
      style={[
        type[variant],
        toneColor[tone] ? { color: toneColor[tone] } : null,
        tint ? { color: tint } : null,
        align ? { textAlign: align } : null,
        style,
      ]}
    />
  );
}
