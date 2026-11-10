import { Text, TextInput, View } from "react-native";
import { currencySymbol, formatNumber } from "../lib/format";
import { useTheme } from "../lib/settings";
import { radius } from "../lib/theme";

// Campo de valor estilo app de banco: você digita só os números
// e os centavos entram sozinhos (2 5 9 0 vira 25,90). Sempre 2 casas decimais.
export function formatMoneyText(value: number) {
  if (!value) return "";
  return formatNumber(value);
}

export function MoneyInput({
  value,
  onChange,
  placeholder = "0,00",
  compact,
  style,
}: {
  value: number;
  onChange: (v: number) => void;
  placeholder?: string;
  compact?: boolean;
  style?: object;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.md,
          paddingHorizontal: 16,
        },
        style,
      ]}
    >
      <Text style={{ color: colors.muted, fontSize: compact ? 14 : 15, marginRight: 6 }}>{currencySymbol()}</Text>
      <TextInput
        value={formatMoneyText(value)}
        onChangeText={(t) => {
          const digits = t.replace(/\D/g, "").slice(0, 11);
          onChange(digits ? parseInt(digits, 10) / 100 : 0);
        }}
        keyboardType="decimal-pad"
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={{
          flex: 1,
          paddingVertical: compact ? 9 : 12,
          fontSize: compact ? 14 : 15,
          color: colors.foreground,
        }}
      />
    </View>
  );
}
