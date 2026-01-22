import { theme } from "./theme";

export function getBrandColors() {
  return {
    dark: theme.colors.primary.dark,
    red: theme.colors.primary.red,
    redHover: "#A01516",
  };
}

export function getSemanticColors() {
  return theme.colors.semantic;
}

export function getNeutralColors() {
  return theme.colors.neutral;
}
