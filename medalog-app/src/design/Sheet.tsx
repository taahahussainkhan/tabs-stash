import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboardInset } from '../core/useKeyboardInset';
import { Stack } from './Layout';
import { Text } from './Text';
import { color, radius, space } from './theme';

/**
 * Bottom sheet, rendered *inside* the main window.
 *
 * Not a react-native <Modal>: on Android a Modal is a separate window with its
 * own insets, so it cannot see the activity's keyboard inset and text fields
 * end up behind the IME. Because this is an in-window overlay it can use the
 * shared keyboard inset and lift itself above the keyboard on every screen.
 */
export function Sheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
  scrollable,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  scrollable?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboardInset();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 180, useNativeDriver: true }).start();
  }, [visible, anim]);

  if (!visible) return null;

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [60, 0] });
  const Body = scrollable ? ScrollView : View;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[StyleSheet.absoluteFill, { backgroundColor: color.overlay, opacity: anim }]}
      />
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close sheet" />

      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: keyboard,
          transform: [{ translateY }],
        }}
      >
        <View
          style={{
            backgroundColor: color.bg,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
            borderWidth: 1,
            borderColor: color.border,
            paddingHorizontal: space(5),
            paddingTop: space(2.5),
            paddingBottom: keyboard > 0 ? space(4) : insets.bottom + space(4.5),
            maxHeight: '92%',
          }}
        >
          <View
            style={{
              alignSelf: 'center',
              width: 44,
              height: 5,
              borderRadius: 3,
              backgroundColor: color.border,
              marginBottom: space(3.5),
            }}
          />
          <Stack gap={1.5} style={{ marginBottom: space(1) }}>
            <Text variant="title">{title}</Text>
            {subtitle ? (
              <Text variant="caption" tone="muted">
                {subtitle}
              </Text>
            ) : null}
          </Stack>
          <Body
            {...(scrollable
              ? { keyboardShouldPersistTaps: 'handled' as const, contentContainerStyle: { paddingBottom: space(2) } }
              : {})}
          >
            <Stack gap={3} style={{ marginTop: space(3) }}>
              {children}
            </Stack>
          </Body>
        </View>
      </Animated.View>
    </View>
  );
}
