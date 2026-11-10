// Paletas do app. O tema claro vem do styles.css do projeto web (oklch -> hex).
export const lightColors = {
  primary: "#C70389",
  primaryForeground: "#FFFFFF",
  roseDeep: "#73085F",
  peach: "#F9B191",
  blush: "#FFE9EB",
  background: "#FFF7F7",
  foreground: "#2C1524",
  card: "#FFFFFF",
  secondary: "#FCE3EE",
  accent: "#FFDDDB",
  accentForeground: "#86046B",
  muted: "#78586A",
  border: "#EFDBE4",
  destructive: "#E7000B",
  overlay: "rgba(44,21,36,0.4)",
};

export type Colors = typeof lightColors;

// Tema escuro: fundo vinho bem escuro, rosa um pouco mais claro para manter o contraste.
export const darkColors: Colors = {
  primary: "#E0309F",
  primaryForeground: "#FFFFFF",
  roseDeep: "#8E0A74",
  peach: "#F9B191",
  blush: "#2B1822",
  background: "#1A0F17",
  foreground: "#FBEFF5",
  card: "#27161F",
  secondary: "#3A2030",
  accent: "#4A2438",
  accentForeground: "#FFB3DD",
  muted: "#C9A9BB",
  border: "#4A2D3E",
  destructive: "#FF6B6B",
  overlay: "rgba(0,0,0,0.6)",
};

// Cores do gráfico de categorias (ordem fixa, validadas para daltonismo)
export const categoryColors: Record<string, string> = {
  Alimentação: "#C70389",
  Compras: "#2F6DB5",
  Moradia: "#E0742B",
  Transporte: "#5B3FB0",
  Saúde: "#1E9E6A",
  Lazer: "#B8860B",
  Outros: "#8A7C86",
  Entradas: "#8A7C86",
};

export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
};

export const shadowCard = {
  shadowColor: "#73085F",
  shadowOpacity: 0.12,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
} as const;

export const shadowGlow = {
  shadowColor: "#C70389",
  shadowOpacity: 0.3,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 10 },
  elevation: 8,
} as const;
