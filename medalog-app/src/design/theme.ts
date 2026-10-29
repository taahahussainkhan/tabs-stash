/**
 * Design tokens.
 *
 * Single source of truth for colour, spacing, radius and type. Screens never
 * hard-code a hex value or a magic number: they read a token, so the whole app
 * (and later the web/extension, which share this language) can be re-skinned
 * from one file.
 */
import { Platform, TextStyle } from 'react-native';

export const color = {
  // surfaces
  bg: '#0f1117',
  surface: '#1a1d27',
  surfaceAlt: '#151821',
  surfaceHigh: '#232735',
  border: '#2a2e3c',
  borderStrong: '#39405280',

  // text
  text: '#e7e9ef',
  textMuted: '#8b90a0',
  textFaint: '#5f6474',
  onAccent: '#ffffff',

  // brand
  accent: '#7c5cff',
  accentSoft: 'rgba(124,92,255,0.16)',
  accentBorder: 'rgba(124,92,255,0.55)',

  // semantic
  danger: '#f08a8a',
  dangerSoft: 'rgba(224,80,80,0.15)',
  dangerBorder: '#5a2a2a',
  success: '#2fb8a6',
  successSoft: 'rgba(47,184,166,0.15)',
  successBorder: '#2b5a54',
  warning: '#e0a33a',
  warningSoft: 'rgba(224,163,58,0.15)',

  // media types (same mapping as the web dashboard)
  movie: '#7c5cff',
  series: '#2fb8a6',
  book: '#e0803a',

  overlay: 'rgba(0,0,0,0.65)',
  scrim: 'rgba(0,0,0,0.45)',
} as const;

/** 4pt spacing scale: space(1) = 4dp ... space(8) = 32dp */
export const space = (n: number) => n * 4;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
} as const;

const font = Platform.select({ ios: 'System', android: 'sans-serif' });

export const type: Record<
  'display' | 'title' | 'heading' | 'subheading' | 'body' | 'bodyStrong' | 'label' | 'caption' | 'micro',
  TextStyle
> = {
  display: { fontSize: 30, fontWeight: '900', letterSpacing: -0.4, color: color.text, fontFamily: font },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.3, color: color.text, fontFamily: font },
  heading: { fontSize: 18, fontWeight: '800', color: color.text, fontFamily: font },
  subheading: { fontSize: 16, fontWeight: '700', color: color.text, fontFamily: font },
  body: { fontSize: 15, lineHeight: 21, color: color.text, fontFamily: font },
  bodyStrong: { fontSize: 15, lineHeight: 21, fontWeight: '600', color: color.text, fontFamily: font },
  label: { fontSize: 13, fontWeight: '700', color: color.text, fontFamily: font },
  caption: { fontSize: 13, lineHeight: 18, color: color.textMuted, fontFamily: font },
  micro: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8, color: color.textMuted, fontFamily: font },
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  floating: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
} as const;
