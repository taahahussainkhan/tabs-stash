import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboardInset } from '../core/useKeyboardInset';
import { color, space } from './theme';

/**
 * A composer bar pinned to the bottom of a screen that lifts itself above the
 * keyboard.
 *
 * Every screen with an input at the bottom reuses this instead of wrestling
 * with KeyboardAvoidingView: the app window is edge-to-edge (adjustNothing), so
 * the only reliable way to clear the IME is to offset by the shared keyboard
 * inset. See core/useKeyboardInset for how that number is derived.
 */
export function KeyboardFooter({
  children,
  style,
  bordered = true,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  bordered?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboardInset();
  const offset = useRef(new Animated.Value(keyboard)).current;

  useEffect(() => {
    Animated.timing(offset, {
      toValue: keyboard,
      duration: 160,
      // `bottom` is a layout property, so this animation is JS driven
      useNativeDriver: false,
    }).start();
  }, [keyboard, offset]);

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: offset,
          backgroundColor: color.bg,
          borderTopWidth: bordered ? 1 : 0,
          borderTopColor: color.border,
          paddingHorizontal: space(4),
          paddingTop: space(2.5),
          // with the keyboard open there is no nav bar to clear
          paddingBottom: keyboard > 0 ? space(2.5) : insets.bottom + space(2.5),
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}
