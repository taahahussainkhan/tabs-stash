import { useEffect, useState } from 'react';
import { Keyboard, KeyboardEvent, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Bottom offset, in dp, that keeps content above the on-screen keyboard
 * (0 when the keyboard is closed).
 *
 * Why this is not just "keyboard height":
 *
 * Android 15 forces edge-to-edge for apps targeting SDK 35+, which turns
 * `android:windowSoftInputMode="adjustResize"` into a no-op - the window keeps
 * its full height, so KeyboardAvoidingView has nothing to react to and every
 * bottom-anchored view ends up *behind* the IME. The manifest therefore asks
 * for `adjustNothing` and we reserve the area ourselves.
 *
 * The area to reserve is the union of two insets that the platform reports
 * separately:
 *
 *   1. the IME height, from React Native's keyboard events, and
 *   2. the navigation bar, because the IME window stops *on top of* the bar
 *      while our edge-to-edge window keeps running underneath it.
 *
 * Using the IME height alone leaves the bottom `navigation-bar` dp of the UI
 * hidden - which is exactly the row of Cancel / Create / Save buttons - so the
 * bar is added back. The bar height is remembered from when the keyboard was
 * closed, so a stale 0 reported while the IME is up can never shrink the pad.
 */
export function useKeyboardInset(): number {
  const insets = useSafeAreaInsets();
  const [ime, setIme] = useState(0);
  const [navBar, setNavBar] = useState(insets.bottom);

  // Keep the last height that was actually on screen; some builds report 0 for
  // the navigation bar while the IME is shown.
  if (insets.bottom > 0 && insets.bottom !== navBar) {
    setNavBar(insets.bottom);
  }

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onChange = (e: KeyboardEvent) => {
      const h = Math.max(0, Math.round(e.endCoordinates?.height ?? 0));
      console.log('[keyboard]', { ime: h, navBar: insets.bottom, window: e.endCoordinates });
      setIme(h);
    };
    const onHide = () => setIme(0);

    const subs = [
      Keyboard.addListener(showEvent, onChange),
      Keyboard.addListener(hideEvent, onHide),
      // re-emitted on rotation / floating keyboards
      Keyboard.addListener('keyboardDidChangeFrame', onChange),
    ];

    return () => subs.forEach(s => s.remove());
  }, [insets.bottom]);

  if (ime <= 0) return 0;

  // iOS already includes the home-indicator area in the keyboard height.
  return Platform.OS === 'android' ? ime + navBar : ime;
}
