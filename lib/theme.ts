/**
 * Brand theme configuration
 * 
 * To customize brand colors, update the values below.
 * Changes will automatically apply throughout the application via:
 * - Tailwind classes (bg-brand-dark, text-brand-red, etc.)
 * - CSS variables (--color-brand-dark, --color-brand-red)
 * - Direct theme import in components
 */
export const theme = {
  colors: {
    primary: {
      dark: "#181818",
      red: "#BA1718",
    },
    semantic: {
      error: "#BA1718",
      success: "#10B981",
      warning: "#F59E0B",
      info: "#3B82F6",
    },
    neutral: {
      white: "#FFFFFF",
      gray50: "#F9FAFB",
      gray100: "#F3F4F6",
      gray200: "#E5E7EB",
      gray300: "#D1D5DB",
      gray400: "#9CA3AF",
      gray500: "#6B7280",
      gray600: "#4B5563",
      gray700: "#374151",
      gray800: "#1F2937",
      gray900: "#111827",
    },
  },
} as const;

export type Theme = typeof theme;
