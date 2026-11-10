import { Bell, Plus, PiggyBank, Repeat, TrendingUp } from "lucide-react-native";
import { useState } from "react";
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CategoryChart } from "../components/CategoryChart";
import { TransactionModal, type Tipo } from "../components/TransactionModal";
import { TransactionRow } from "../components/TransactionRow";
import { EmptyBox, ErrorText, GradientBox } from "../components/ui";
import { capitalize, formatMoney, monthLabel, monthName, toISO, todayStr, weekdayLetter } from "../lib/format";
import { useStyles, useTheme } from "../lib/settings";
import { radius, shadowCard, type Colors } from "../lib/theme";
import type { Tab } from "../lib/types";
import { useTransactions } from "../lib/useTransactions";

export default function HomeScreen({
  name,
  avatarUrl,
  go,
}: {
  name: string;
  avatarUrl?: string;
  go: (t: Tab) => void;
}) {
  const { transactions, loading, error, reload } = useTransactions();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const [modal, setModal] = useState<Tipo | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const monthPrefix = todayStr().slice(0, 7);
  const monthTx = transactions.filter((t) => t.date.startsWith(monthPrefix));
  const balance = transactions.reduce((s, t) => s + t.amount, 0);
  const income = monthTx.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expenses = monthTx.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  // Gastos dos últimos 7 dias
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = toISO(d);
    const total = transactions
      .filter((t) => t.date === key && t.amount < 0)
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    return { key, total, day: weekdayLetter(d) };
  });
  const maxSpend = Math.max(...last7.map((d) => d.total), 1);
  const weekTotal = last7.reduce((s, d) => s + d.total, 0);

  const initials = name.slice(0, 2).toUpperCase();

  // Os 4 tipos de lançamento
  const actions: { icon: typeof Plus; label: string; tipo: Tipo }[] = [
    { icon: Plus, label: "Novo gasto", tipo: "saida" },
    { icon: TrendingUp, label: "Nova entrada", tipo: "entrada" },
    { icon: Repeat, label: "Recorrente", tipo: "recorrente" },
    { icon: PiggyBank, label: "Guardar", tipo: "meta" },
  ];

  async function onRefresh() {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, paddingBottom: 30 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Pressable onPress={() => go("perfil")} style={styles.avatar}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={{ width: 44, height: 44 }} />
            ) : (
              <Text style={{ color: colors.primary, fontWeight: "700" }}>{initials}</Text>
            )}
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, color: colors.muted }}>Bem-vinda de volta</Text>
            <Text numberOfLines={1} style={{ fontSize: 18, fontWeight: "700", color: colors.foreground }}>
              Olá, {name}
            </Text>
          </View>
          <View style={styles.bell}>
            <Bell size={20} color={colors.primary} />
          </View>
        </View>

        {/* Saldo */}
        <GradientBox style={{ marginTop: 22, padding: 24 }}>
          <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>Saldo total</Text>
          <Text style={{ color: "#fff", fontSize: 36, fontWeight: "700", marginTop: 4, letterSpacing: -1 }}>
            {formatMoney(balance)}
          </Text>
          <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
            <View style={styles.pill}>
              <Text style={styles.pillLabel}>Entradas do mês</Text>
              <Text style={styles.pillValue}>{formatMoney(income)}</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillLabel}>Saídas do mês</Text>
              <Text style={styles.pillValue}>{formatMoney(expenses)}</Text>
            </View>
          </View>
        </GradientBox>

        <ErrorText>{error ? `Não foi possível carregar: ${error}` : ""}</ErrorText>

        {/* Ações rápidas: um atalho para cada tipo de lançamento */}
        <View style={{ flexDirection: "row", gap: 12, marginTop: 26 }}>
          {actions.map((a) => (
            <Pressable key={a.label} onPress={() => setModal(a.tipo)} style={{ flex: 1, alignItems: "center", gap: 8 }}>
              <View style={styles.actionIcon}>
                <a.icon size={22} color={colors.primary} />
              </View>
              <Text style={{ fontSize: 11, fontWeight: "500", color: colors.muted, textAlign: "center" }}>
                {a.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Gastos da semana */}
        <View style={styles.card}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text style={styles.cardTitle}>Gastos da semana</Text>
              <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>{capitalize(monthName())}</Text>
            </View>
            <Text style={{ fontSize: 18, fontWeight: "700", color: colors.primary }}>{formatMoney(weekTotal)}</Text>
          </View>
          <View style={styles.bars}>
            {last7.map((bar, i) => (
              <View key={bar.key} style={{ flex: 1, alignItems: "center", gap: 8 }}>
                <View
                  style={{
                    width: 14,
                    height: Math.max(6, (bar.total / maxSpend) * 70),
                    borderRadius: 999,
                    backgroundColor: i === 6 ? colors.primary : colors.secondary,
                  }}
                />
                <Text style={{ fontSize: 10, fontWeight: "500", color: colors.muted }}>{bar.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Dashboard por categoria */}
        <View style={styles.card}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text style={styles.cardTitle}>Gastos por categoria</Text>
              <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
                {capitalize(monthLabel(monthPrefix))}
              </Text>
            </View>
            <Pressable onPress={() => go("gastos")}>
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.primary }}>Detalhes</Text>
            </Pressable>
          </View>
          <CategoryChart transactions={monthTx} />
        </View>

        {/* Transações recentes */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 26 }}>
          <Text style={styles.cardTitle}>Transações recentes</Text>
          <Pressable onPress={() => go("gastos")}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.primary }}>Ver tudo</Text>
          </Pressable>
        </View>

        {!loading && transactions.length === 0 ? (
          <EmptyBox>Nenhuma transação ainda. Toque em "Novo gasto" para começar.</EmptyBox>
        ) : (
          <View style={{ gap: 12, marginTop: 14 }}>
            {transactions.slice(0, 8).map((t) => (
              <TransactionRow key={t.id} t={t} />
            ))}
          </View>
        )}
      </ScrollView>

      <TransactionModal
        visible={modal !== null}
        transaction={null}
        initialTipo={modal ?? "saida"}
        onClose={() => setModal(null)}
        onSaved={() => {
          setModal(null);
          reload();
        }}
      />
    </View>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    header: { flexDirection: "row", alignItems: "center", gap: 12 },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    bell: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    pill: {
      flex: 1,
      backgroundColor: "rgba(255,255,255,0.15)",
      borderRadius: radius.md,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    pillLabel: { color: "rgba(255,255,255,0.75)", fontSize: 12 },
    pillValue: { color: "#fff", fontSize: 14, fontWeight: "700", marginTop: 2 },
    actionIcon: {
      width: "100%",
      height: 56,
      borderRadius: radius.md,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    card: {
      marginTop: 26,
      backgroundColor: colors.card,
      borderRadius: radius.xxl,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 20,
      ...shadowCard,
    },
    cardTitle: { fontSize: 16, fontWeight: "700", color: colors.foreground },
    bars: {
      marginTop: 20,
      height: 96,
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 8,
    },
  });
