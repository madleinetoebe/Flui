import { ArrowDownRight, ArrowUpRight, Pencil, Repeat, Trash2 } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { dateLabel, formatBRL } from "../lib/format";
import { recurrenceLabel } from "../lib/recurrence";
import { useStyles, useTheme } from "../lib/settings";
import { radius, type Colors } from "../lib/theme";
import type { Transaction } from "../lib/types";

export function TransactionRow({
  t,
  relative = true,
  onEdit,
  onDelete,
}: {
  t: Transaction;
  relative?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const income = t.amount > 0;
  const isRecurring = (!!t.recurrence && t.recurrence !== "none") || !!t.parent_id;
  return (
    <View style={styles.row}>
      <View style={[styles.icon, { backgroundColor: income ? colors.secondary : colors.accent }]}>
        {income ? (
          <ArrowUpRight size={18} color={colors.primary} />
        ) : (
          <ArrowDownRight size={18} color={colors.roseDeep} />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={styles.name}>
          {t.name}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Text numberOfLines={1} style={[styles.meta, { flexShrink: 1 }]}>
            {t.category} · {dateLabel(t.date, relative)}
          </Text>
          {isRecurring && <Repeat size={11} color={colors.primary} />}
          {isRecurring && t.recurrence && t.recurrence !== "none" ? (
            <Text style={[styles.meta, { color: colors.primary }]}>{recurrenceLabel(t.recurrence)}</Text>
          ) : null}
        </View>
        {onEdit && (
          <Text style={[styles.amount, { color: income ? colors.primary : colors.foreground, marginTop: 2 }]}>
            {formatBRL(t.amount)}
          </Text>
        )}
      </View>
      {onEdit ? (
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pressable onPress={onEdit} style={[styles.action, { backgroundColor: colors.secondary }]}>
            <Pencil size={16} color={colors.primary} />
          </Pressable>
          <Pressable onPress={onDelete} style={[styles.action, { backgroundColor: colors.accent }]}>
            <Trash2 size={16} color={colors.destructive} />
          </Pressable>
        </View>
      ) : (
        <Text style={[styles.amount, { color: income ? colors.primary : colors.foreground }]}>
          {formatBRL(t.amount)}
        </Text>
      )}
    </View>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      padding: 14,
    },
    icon: {
      width: 40,
      height: 40,
      borderRadius: radius.sm,
      alignItems: "center",
      justifyContent: "center",
    },
    name: { fontSize: 14, fontWeight: "600", color: colors.foreground },
    meta: { fontSize: 12, color: colors.muted, marginTop: 1 },
    amount: { fontSize: 14, fontWeight: "700" },
    action: {
      width: 36,
      height: 36,
      borderRadius: radius.sm,
      alignItems: "center",
      justifyContent: "center",
    },
  });
