import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../design/Text';
import { color, radius, space } from '../design/theme';
import type { Navigation, Route, RouteName, TabKey } from './types';

/**
 * A small, dependency-free navigator: bottom tabs plus a push stack.
 *
 * The navigator knows nothing about features - screens are injected as a
 * registry - so adding a feature never touches navigation code, and features
 * never import each other.
 */
const NavContext = createContext<Navigation | null>(null);

export function useNavigation(): Navigation {
  const nav = useContext(NavContext);
  if (!nav) throw new Error('useNavigation must be used inside <Navigator>.');
  return nav;
}

export interface NavigatorProps {
  /** one component per tab */
  tabs: Record<TabKey, React.ComponentType>;
  /** one component per pushed route */
  routes: Record<RouteName, React.ComponentType<any>>;
  initialTab?: TabKey;
}

const TAB_META: Record<TabKey, { label: string; icon: TabKey }> = {
  home: { label: 'Home', icon: 'home' },
  capture: { label: 'Capture', icon: 'capture' },
  tabs: { label: 'Tabs', icon: 'tabs' },
  library: { label: 'Library', icon: 'library' },
  profile: { label: 'Account', icon: 'profile' },
};

export function Navigator({ tabs, routes, initialTab = 'home' }: NavigatorProps) {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<TabKey>(initialTab);
  const [stack, setStack] = useState<Route[]>([]);
  const anim = useRef(new Animated.Value(0)).current;

  const push = useCallback(
    (route: Route) => {
      setStack(prev => [...prev, route]);
      anim.setValue(0);
      Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    },
    [anim]
  );

  const pop = useCallback(() => setStack(prev => prev.slice(0, -1)), []);
  const popToRoot = useCallback(() => setStack([]), []);

  const nav = useMemo<Navigation>(
    () => ({ tab, setTab, depth: stack.length, push, pop, popToRoot }),
    [tab, stack.length, push, pop, popToRoot]
  );

  const top = stack[stack.length - 1];
  const ActiveTab = tabs[tab];
  const RouteScreen = top ? routes[top.name] : null;

  return (
    <NavContext.Provider value={nav}>
      <View style={{ flex: 1, backgroundColor: color.bg, paddingTop: insets.top }}>
        {top && RouteScreen ? (
          <Animated.View
            style={{
              flex: 1,
              opacity: anim,
              transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
            }}
          >
            <RouteScreen {...(top as any)} onBack={pop} />
          </Animated.View>
        ) : (
          <ActiveTab />
        )}
      </View>

      {stack.length === 0 ? <TabBar tab={tab} onChange={setTab} bottomInset={insets.bottom} /> : null}
    </NavContext.Provider>
  );
}

function TabBar({
  tab,
  onChange,
  bottomInset,
}: {
  tab: TabKey;
  onChange: (tab: TabKey) => void;
  bottomInset: number;
}) {
  const keys = Object.keys(TAB_META) as TabKey[];
  return (
    <View
      style={{
        flexDirection: 'row',
        borderTopWidth: StyleSheet.hairlineWidth * 2,
        borderTopColor: color.border,
        backgroundColor: color.surfaceAlt,
        paddingBottom: Math.max(bottomInset, space(2)),
        paddingTop: space(2),
      }}
    >
      {keys.map(key => {
        const active = key === tab;
        const meta = TAB_META[key];
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={meta.label}
            style={{ flex: 1, alignItems: 'center', gap: space(1), paddingVertical: space(1) }}
          >
            <TabIcon name={meta.icon} active={active} />
            <Text variant="caption" style={{ fontSize: 11 }} tint={active ? color.accent : color.textFaint}>
              {meta.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Icons drawn with plain views - no icon dependency, and they inherit the theme. */
function TabIcon({ name, active }: { name: TabKey; active: boolean }) {
  const tint = active ? color.accent : color.textFaint;
  const thickness = 2;

  if (name === 'home') {
    return (
      <View style={{ width: 20, height: 20, justifyContent: 'center', gap: 3 }}>
        <View style={{ height: 7, borderRadius: 2, backgroundColor: tint }} />
        <View style={{ flexDirection: 'row', gap: 3 }}>
          <View style={{ flex: 1, height: 7, borderRadius: 2, backgroundColor: tint, opacity: 0.6 }} />
          <View style={{ flex: 1, height: 7, borderRadius: 2, backgroundColor: tint, opacity: 0.6 }} />
        </View>
      </View>
    );
  }

  if (name === 'capture') {
    return (
      <View style={{ width: 22, height: 22, justifyContent: 'center' }}>
        <View style={{ borderWidth: thickness, borderColor: tint, borderRadius: 4, height: 16, width: 22 }} />
        <View style={{ position: 'absolute', alignSelf: 'center', width: 10, height: thickness, backgroundColor: tint }} />
        <View style={{ position: 'absolute', alignSelf: 'center', width: thickness, height: 10, backgroundColor: tint }} />
      </View>
    );
  }

  if (name === 'tabs') {
    return (
      <View style={{ width: 22, height: 22, justifyContent: 'flex-end' }}>
        <View style={{ height: 3, width: 14, borderRadius: 2, backgroundColor: tint, opacity: 0.45, marginBottom: 3, marginLeft: 4 }} />
        <View style={{ height: 3, width: 18, borderRadius: 2, backgroundColor: tint, opacity: 0.7, marginBottom: 3, marginLeft: 2 }} />
        <View style={{ height: 3, width: 22, borderRadius: 2, backgroundColor: tint }} />
      </View>
    );
  }

  if (name === 'library') {
    return (
      <View style={{ width: 20, height: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 3 }}>
        {[0, 1, 2, 3].map(i => (
          <View key={i} style={{ width: 8.5, height: 8.5, borderRadius: 2, backgroundColor: tint, opacity: i === 0 ? 1 : 0.6 }} />
        ))}
      </View>
    );
  }

  return (
    <View style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: tint }} />
      <View
        style={{
          width: 18,
          height: radius.sm,
          borderTopLeftRadius: 9,
          borderTopRightRadius: 9,
          backgroundColor: tint,
          marginTop: 2,
          opacity: 0.85,
        }}
      />
    </View>
  );
}
