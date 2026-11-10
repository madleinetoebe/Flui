import { Text } from "react-native";
import { useTheme } from "../lib/settings";

export function Logo({ size = 22 }: { size?: number }) {
  const { colors } = useTheme();
  return (
    <Text style={{ fontSize: size, fontWeight: "700", letterSpacing: -0.5, color: colors.foreground }}>
      Cash<Text style={{ color: colors.primary }}>Track</Text>
    </Text>
  );
}
