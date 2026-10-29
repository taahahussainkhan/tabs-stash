import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { Text } from './Text';
import { color, radius, space } from './theme';

export interface FabAction {
  key: string;
  label: string;
  glyph: string;
  /** accent for the action's round badge */
  tint?: string;
  onPress: () => void;
}

/**
 * The one floating action button.
 *
 * Tapping it fans the actions out vertically above it, each a labelled pill so
 * the meaning is never a guess. In-window (no Modal) so sheets opened from an
 * action still share the screen's keyboard inset, and it stops intercepting
 * touches the moment it closes.
 */
export function Fab({
  actions,
  bottom = 0,
  glyph = '＋',
  label = 'New',
}: {
  actions: FabAction[];
  /** distance from the bottom of the parent, in px */
  bottom?: number;
  glyph?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: open ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [open, anim]);

  // close the menu as soon as an action is taken
  const pick = (action: FabAction) => {
    setOpen(false);
    action.onPress();
  };

  const rotation = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });

  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', right: space(5), bottom, alignItems: 'flex-end' }}>
      {open ? (
        <Pressable
          onPress={() => setOpen(false)}
          accessibilityLabel="Close actions"
          style={{ position: 'absolute', right: -space(5), bottom: -bottom, width: 4000, height: 4000 }}
        />
      ) : null}

      {actions.map((action, index) => {
        // cascade: each row starts slightly later than the one below it
        const start = index / (actions.length + 1);
        const translateY = anim.interpolate({
          inputRange: [start, 1],
          outputRange: [14, 0],
          extrapolate: 'clamp',
        });
        const opacity = anim.interpolate({
          inputRange: [start, 1],
          outputRange: [0, 1],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={action.key}
            pointerEvents={open ? 'auto' : 'none'}
            style={{ opacity, transform: [{ translateY }], marginBottom: space(2.5) }}
          >
            <Pressable
              onPress={() => pick(action)}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              android_ripple={{ color: 'rgba(255,255,255,0.08)', borderless: false }}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: space(2.5),
                backgroundColor: color.surfaceHigh,
                borderColor: color.border,
                borderWidth: 1,
                borderRadius: radius.pill,
                paddingLeft: space(4),
                paddingRight: space(1.5),
                paddingVertical: space(1.5),
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text variant="label">{action.label}</Text>
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: radius.pill,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: action.tint ? `${action.tint}22` : color.surfaceAlt,
                  borderWidth: 1,
                  borderColor: action.tint ? `${action.tint}88` : color.border,
                }}
              >
                <Text style={{ fontSize: 15, color: action.tint ?? color.text }}>{action.glyph}</Text>
              </View>
            </Pressable>
          </Animated.View>
        );
      })}

      <Pressable
        onPress={() => setOpen(v => !v)}
        accessibilityRole="button"
        accessibilityLabel={open ? 'Close actions' : `${label} actions`}
        accessibilityState={{ expanded: open }}
        android_ripple={{ color: 'rgba(255,255,255,0.12)', radius: 31 }}
        style={({ pressed }) => ({
          width: 62,
          height: 62,
          borderRadius: 31,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: color.accent,
          borderWidth: 1,
          borderColor: color.accent,
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Text style={{ fontSize: 26, color: color.onAccent }}>{glyph}</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}
