import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from './Controls';
import { Stack } from './Layout';
import { Text } from './Text';
import { color, radius, space } from './theme';

/* --------------------------------------------------------------- empties */

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
  glyph,
}: {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  glyph?: string;
}) {
  return (
    <Stack align="center" justify="center" gap={3} style={{ paddingVertical: space(14), paddingHorizontal: space(6) }}>
      {glyph ? <Text style={{ fontSize: 34, opacity: 0.6 }}>{glyph}</Text> : null}
      <Text variant="subheading" align="center">
        {title}
      </Text>
      {message ? (
        <Text variant="caption" align="center" tone="muted">
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} variant="secondary" size="sm" /> : null}
    </Stack>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = error instanceof Error ? error.message : 'Something went wrong.';
  return (
    <EmptyState
      glyph="⚠"
      title="Could not load"
      message={message}
      actionLabel={onRetry ? 'Try again' : undefined}
      onAction={onRetry}
    />
  );
}

/* ----------------------------------------------------------------- toast */

type Tone = 'default' | 'success' | 'danger';

interface ToastApi {
  show: (message: string, tone?: Tone) => void;
}

const ToastContext = createContext<ToastApi>({ show: () => {} });

export const useToast = () => useContext(ToastContext);

const toneBg: Record<Tone, string> = {
  default: color.surfaceHigh,
  success: color.successBorder,
  danger: color.dangerBorder,
};

/** App-wide transient message. One instance at the root, any screen can fire. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<{ message: string; tone: Tone } | null>(null);
  const anim = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (message: string, tone: Tone = 'default') => {
      if (timer.current) clearTimeout(timer.current);
      setToast({ message, tone });
      Animated.timing(anim, { toValue: 1, duration: 160, useNativeDriver: true }).start();
      timer.current = setTimeout(() => {
        Animated.timing(anim, { toValue: 0, duration: 160, useNativeDriver: true }).start(({ finished }) => {
          if (finished) setToast(null);
        });
      }, 2800);
    },
    [anim]
  );

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toast ? (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: space(5),
            right: space(5),
            bottom: insets.bottom + space(22),
            opacity: anim,
            transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
          }}
        >
          <View
            style={{
              backgroundColor: toneBg[toast.tone],
              borderColor: color.border,
              borderWidth: 1,
              borderRadius: radius.md,
              paddingVertical: space(3),
              paddingHorizontal: space(4),
            }}
          >
            <Text variant="caption" align="center" style={{ color: color.text }}>
              {toast.message}
            </Text>
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}
