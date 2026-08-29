import { themeConfig } from './src/theme.config';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: themeConfig.colors.primary,
        secondary: themeConfig.colors.secondary,
        accent: themeConfig.colors.accent,
        background: themeConfig.colors.background,
        surface: themeConfig.colors.surface,
        "surface-light": themeConfig.colors["surface-light"],
        "surface-lighter": themeConfig.colors["surface-lighter"],
        error: themeConfig.colors.error,
        success: themeConfig.colors.success,
        content: themeConfig.colors.content,
        pastel: themeConfig.colors.pastel,
      },
      borderRadius: {
        ...themeConfig.borderRadius,
      },
      boxShadow: {
        ...themeConfig.boxShadow,
        'soft': '0 20px 50px -12px rgba(0, 0, 0, 0.8)',
        'pastel-glow': '0 0 25px -5px var(--glow-color)',
        'glass': 'inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
      },
      fontFamily: {
        serif: ["Playfair Display", "serif"],
        sans: ["Inter", "sans-serif"],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'plum-gradient': 'linear-gradient(135deg, #290025 0%, #0d000c 100%)',
      }
    },
  },
  plugins: [],
};
