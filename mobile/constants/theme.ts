export const colors = {
  primary: "#208AEF",
  primaryDark: "#1B76CC",
  background: "#0F172A",
  surface: "#1E293B",
  border: "#334155",
  muted: "#94A3B8",
  white: "#FFFFFF",
  success: "#22C55E",
  danger: "#EF4444",
  warning: "#F59E0B",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
} as const;

export const typography = {
  h1: 28,
  h2: 22,
  h3: 18,
  body: 16,
  caption: 13,
} as const;

export const theme = {
  colors,
  spacing,
  radius,
  typography,
} as const;

export default theme;