import { Home, PieChart, Target, User } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStyles, useTheme } from "../lib/settings";
import type { Colors } from "../lib/theme";
import type { Tab } from "../lib/types";

const tabs = [
  { key: "inicio", label: "Início", icon: Home },
  { key: "gastos", label: "Gastos", icon: PieChart },
  { key: "metas", label: "Metas", icon: Target },
  { key: "perfil", label: "Perfil", icon: User },
] as const;

export function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {tabs.map((t) => {
        const on = t.key === active;
        const color = on ? colors.primary : colors.muted;
        return (
          <Pressable key={t.key} style={styles.item} onPress={() => onChange(t.key)}>
            <t.icon size={22} color={color} />
            <Text style={{ fontSize: 11, fontWeight: "600", color }}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    bar: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 10,
    },
    item: { flex: 1, alignItems: "center", gap: 4 },
  });
