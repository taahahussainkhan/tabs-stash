/**
 * Legacy Tailwind (v3-style) mirror of the design tokens.
 *
 * The live palette lives in `src/index.css` under `@theme` — Tailwind v4 reads
 * CSS first. This file is kept in sync only for the few places that import it
 * directly and for tooling that expects a JS object.
 */
export const themeConfig = {
  colors: {
    primary: "#7c5cff",
    secondary: "#1a1d27",
    accent: "#7c5cff",
    background: "#0f1117",
    surface: "#1a1d27",
    "surface-light": "#232735",
    "surface-secondary": "#151821",
    "surface-input": "#12141c",
    "surface-high": "#2b3143",
    "border-main": "#2a2e3c",
    "border-subtle": "#21242f",
    error: "#f0808a",
    success: "#2fb8a6",
    warning: "#e0a33a",
    info: "#2fb8a6",
    editorial: {
      violet: "#7c5cff",
      ochre: "#e0a33a",
      sage: "#2fb8a6",
      cyan: "#4ea8ff",
      indigo: "#9a86ff",
      crimson: "#f0808a",
    },
    content: {
      primary: "#e7e9ef",
      secondary: "#8b90a0",
      muted: "#5f6474",
    }
  },
  borderRadius: {
    xs: "6px",
    sm: "9px",
    md: "14px",
    lg: "18px",
    xl: "24px",
  }
} as const;
