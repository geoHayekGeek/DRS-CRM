import type { Config } from "tailwindcss";
import { theme } from "./lib/theme";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: theme.colors.primary.dark,
          red: theme.colors.primary.red,
        },
        error: theme.colors.semantic.error,
        success: theme.colors.semantic.success,
        warning: theme.colors.semantic.warning,
        info: theme.colors.semantic.info,
      },
    },
  },
  plugins: [],
};
export default config;
