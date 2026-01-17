import { Platform } from "react-native";

const tintColorLight = "#2563EB";
const tintColorDark = "#3B82F6";

export const Colors = {
  light: {
    text: "#111827",
    textSecondary: "#6B7280",
    buttonText: "#FFFFFF",
    tabIconDefault: "#6B7280",
    tabIconSelected: tintColorLight,
    link: "#2563EB",
    primary: "#2563EB",
    accent: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    backgroundRoot: "#F9FAFB",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#F3F4F6",
    backgroundTertiary: "#E5E7EB",
    border: "#E5E7EB",
    success: "#10B981",
    scoreExcellent: "#10B981",
    scoreGood: "#3B82F6",
    scoreAverage: "#F59E0B",
    scorePoor: "#EF4444",
    cardShadow: "rgba(0, 0, 0, 0.05)",
    premium: "#F59E0B",
  },
  dark: {
    text: "#F9FAFB",
    textSecondary: "#9CA3AF",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    link: "#3B82F6",
    primary: "#3B82F6",
    accent: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    backgroundRoot: "#111827",
    backgroundDefault: "#1F2937",
    backgroundSecondary: "#374151",
    backgroundTertiary: "#4B5563",
    border: "#374151",
    success: "#10B981",
    scoreExcellent: "#10B981",
    scoreGood: "#3B82F6",
    scoreAverage: "#F59E0B",
    scorePoor: "#EF4444",
    cardShadow: "rgba(0, 0, 0, 0.3)",
    premium: "#F59E0B",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  full: 9999,
};

export const Typography = {
  hero: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700" as const,
  },
  h1: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600" as const,
  },
  h3: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500" as const,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
