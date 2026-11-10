import { Pressable, Text, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { formatBRL } from "../lib/format";
import { useTheme } from "../lib/settings";
import { categoryColors } from "../lib/theme";
import type { Transaction } from "../lib/types";

// Gastos por categoria: rosca + legenda com valor e porcentagem.
// A legenda sempre aparece, então a cor nunca é a única pista.
export function CategoryChart({
  transactions,
  active,
  onSelect,
}: {
  transactions: Transaction[]; // já filtradas pelo mês
  active?: string; // categoria selecionada (opcional)
  onSelect?: (category: string) => void;
}) {
  const { colors } = useTheme();
  const totals = new Map<string, number>();
  for (const t of transactions) {
    if (t.amount >= 0) continue;
    totals.set(t.category, (totals.get(t.category) ?? 0) + Math.abs(t.amount));
  }
  const rows = [...totals.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  const total = rows.reduce((s, r) => s + r.value, 0);

  if (total === 0) {
    return (
      <Text style={{ marginTop: 14, fontSize: 13, color: colors.muted }}>
        Nenhum gasto neste período para mostrar no gráfico.
      </Text>
    );
  }

  const size = 150;
  const stroke = 22;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const center = size / 2;
  const gap = rows.length > 1 ? 3 : 0;
  let acc = 0;

  return (
    <View style={{ marginTop: 16 }}>
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <Svg width={size} height={size}>
          <G transform={`rotate(-90 ${center} ${center})`}>
            <Circle cx={center} cy={center} r={r} stroke={colors.secondary} strokeWidth={stroke} fill="none" />
            {rows.map((row) => {
              const len = (row.value / total) * c;
              const seg = (
                <Circle
                  key={row.name}
                  cx={center}
                  cy={center}
                  r={r}
                  stroke={categoryColors[row.name] ?? colors.muted}
                  strokeWidth={stroke}
                  fill="none"
                  strokeDasharray={`${Math.max(len - gap, 0.5)} ${c}`}
                  strokeDashoffset={-acc}
                  opacity={active && active !== "Todas" && active !== row.name ? 0.3 : 1}
                />
              );
              acc += len;
              return seg;
            })}
          </G>
        </Svg>
        <View style={{ position: "absolute", alignItems: "center" }}>
          <Text style={{ fontSize: 11, color: colors.muted }}>Total</Text>
          <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>{formatBRL(total)}</Text>
        </View>
      </View>

      <View style={{ marginTop: 18, gap: 4 }}>
        {rows.map((row) => {
          const pct = (row.value / total) * 100;
          return (
            <Pressable
              key={row.name}
              onPress={() => onSelect?.(active === row.name ? "Todas" : row.name)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                paddingVertical: 8,
                paddingHorizontal: 10,
                borderRadius: 12,
                backgroundColor: active === row.name ? colors.secondary : "transparent",
              }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 4,
                  backgroundColor: categoryColors[row.name] ?? colors.muted,
                }}
              />
              <Text style={{ flex: 1, fontSize: 14, color: colors.foreground }}>{row.name}</Text>
              <Text style={{ fontSize: 13, color: colors.muted }}>{pct < 1 ? "<1" : Math.round(pct)}%</Text>
              <Text style={{ minWidth: 86, textAlign: "right", fontSize: 14, fontWeight: "700", color: colors.foreground }}>
                {formatBRL(row.value)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
