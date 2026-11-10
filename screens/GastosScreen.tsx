import { ChevronLeft, ChevronRight, Plus } from "lucide-react-native";
import { useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CategoryChart } from "../components/CategoryChart";
import { TransactionModal } from "../components/TransactionModal";
import { TransactionRow } from "../components/TransactionRow";
import { Chip, EmptyBox, ErrorText, GradientBox, Segmented } from "../components/ui";
import { confirmAction, showError } from "../lib/confirm";
import { capitalize, formatMoney, monthLabel, shiftMonth, todayStr } from "../lib/format";
import { useStyles, useTheme } from "../lib/settings";
import { supabase } from "../lib/supabase";
import { radius, shadowCard, type Colors } from "../lib/theme";
import { categories, type Transaction } from "../lib/types";
import { useTransactions } from "../lib/useTransactions";

type ModalState = null | { transaction: Transaction | null };
type Kind = "todos" | "despesas" | "entradas";

export default function GastosScreen() {
  const { transactions, loading, error, reload } = useTransactions();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const [month, setMonth] = useState(todayStr().slice(0, 7));
  const [kind, setKind] = useState<Kind>("todos");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [modal, setModal] = useState<ModalState>(null);
  const [refreshing, setRefreshing] = useState(false);

  const monthTx = transactions.filter((t) => t.date.startsWith(month));
  // Os totais do topo sempre mostram o mês inteiro; os filtros mexem só na lista
  const totalIn = monthTx.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalOut = monthTx.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  const filtered = monthTx.filter((t) => {
    if (kind === "despesas" && t.amount >= 0) return false;
    if (kind === "entradas" && t.amount <= 0) return false;
    return categoryFilter === "Todas" || t.category === categoryFilter;
  });

  function confirmDelete(t: Transaction) {
    const isTemplate = !!t.recurrence && t.recurrence !== "none";
    confirmAction(
      "Apagar lançamento",
      isTemplate
        ? `Apagar "${t.name}"? A repetição automática é encerrada. Os lançamentos já feitos continuam.`
        : `Apagar "${t.name}"?`,
      "Apagar",
      async () => {
        const { error } = await supabase.from("transactions").delete().eq("id", t.id);
        if (error) showError(error.message);
        else reload();
      },
    );
  }

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
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={styles.title}>Gastos</Text>
          <Pressable onPress={() => setModal({ transaction: null })}>
            <GradientBox style={styles.newBtn}>
              <Plus size={16} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>Novo</Text>
            </GradientBox>
          </Pressable>
        </View>

        {/* Mês */}
        <View style={styles.monthBox}>
          <Pressable style={styles.arrow} onPress={() => setMonth(shiftMonth(month, -1))}>
            <ChevronLeft size={20} color={colors.primary} />
          </Pressable>
          <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground }}>
            {capitalize(monthLabel(month))}
          </Text>
          <Pressable style={styles.arrow} onPress={() => setMonth(shiftMonth(month, 1))}>
            <ChevronRight size={20} color={colors.primary} />
          </Pressable>
        </View>

        {/* Resumo: tocar em um card filtra a lista */}
        <View style={{ flexDirection: "row", gap: 12, marginTop: 14 }}>
          <Pressable
            style={[styles.summary, { backgroundColor: colors.secondary }]}
            onPress={() => setKind(kind === "entradas" ? "todos" : "entradas")}
          >
            <Text style={styles.summaryLabel}>Entradas</Text>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>{formatMoney(totalIn)}</Text>
          </Pressable>
          <Pressable
            style={[styles.summary, { backgroundColor: colors.accent }]}
            onPress={() => setKind(kind === "despesas" ? "todos" : "despesas")}
          >
            <Text style={styles.summaryLabel}>Despesas</Text>
            <Text style={[styles.summaryValue, { color: colors.foreground }]}>{formatMoney(totalOut)}</Text>
          </Pressable>
        </View>

        {/* Dashboard por categoria */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Gastos por categoria</Text>
          <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
            Toque numa categoria para filtrar a lista
          </Text>
          <CategoryChart transactions={monthTx} active={categoryFilter} onSelect={setCategoryFilter} />
        </View>

        {/* Filtros */}
        <View style={{ marginTop: 18 }}>
          <Segmented<Kind>
            value={kind}
            onChange={setKind}
            options={[
              { key: "todos", label: "Todos" },
              { key: "despesas", label: "Despesas" },
              { key: "entradas", label: "Entradas" },
            ]}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 14 }}
        >
          {["Todas", ...categories].map((c) => (
            <Chip key={c} label={c} active={categoryFilter === c} onPress={() => setCategoryFilter(c)} />
          ))}
        </ScrollView>

        <ErrorText>{error ? `Não foi possível carregar: ${error}` : ""}</ErrorText>

        {/* Lista */}
        {!loading && filtered.length === 0 ? (
          <EmptyBox>Nenhum lançamento neste período.</EmptyBox>
        ) : (
          <View style={{ gap: 12, marginTop: 6 }}>
            {filtered.map((t) => (
              <TransactionRow
                key={t.id}
                t={t}
                relative={false}
                onEdit={() => setModal({ transaction: t })}
                onDelete={() => confirmDelete(t)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <TransactionModal
        visible={modal !== null}
        transaction={modal?.transaction ?? null}
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
    title: { fontSize: 26, fontWeight: "700", color: colors.foreground },
    newBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: radius.md,
    },
    monthBox: {
      marginTop: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      padding: 8,
    },
    arrow: {
      width: 40,
      height: 40,
      borderRadius: radius.sm,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    summary: { flex: 1, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 12 },
    summaryLabel: { fontSize: 12, color: colors.muted },
    summaryValue: { fontSize: 14, fontWeight: "700", marginTop: 2 },
    card: {
      marginTop: 18,
      backgroundColor: colors.card,
      borderRadius: radius.xxl,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 20,
      ...shadowCard,
    },
    cardTitle: { fontSize: 16, fontWeight: "700", color: colors.foreground },
  });
