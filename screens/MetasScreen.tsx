import { LinearGradient } from "expo-linear-gradient";
import { Plus, Repeat, Trash2, Trophy } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DateField } from "../components/DateField";
import { GoalIcon, iconKeys } from "../components/GoalIcon";
import { MoneyInput } from "../components/MoneyInput";
import { Ring } from "../components/Ring";
import { Chip, EmptyBox, ErrorText, FieldLabel, Input, PrimaryButton, Segmented, Sheet } from "../components/ui";
import { confirmAction, showError } from "../lib/confirm";
import { formatMoney, isoToBr, monthsLeft, todayStr } from "../lib/format";
import { recurrenceOptions, recurrencePer, runRecurrences } from "../lib/recurrence";
import { useStyles, useTheme } from "../lib/settings";
import { supabase } from "../lib/supabase";
import { radius, shadowCard, shadowGlow, type Colors } from "../lib/theme";
import type { Deposit, Goal, Recurrence } from "../lib/types";

type Filter = "todas" | "andamento" | "concluidas";

export default function MetasScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState<Filter>("todas");
  const [openId, setOpenId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [g, d] = await Promise.all([
      supabase.from("goals").select("*").order("created_at", { ascending: false }),
      supabase.from("goal_deposits").select("id, goal_id, amount, created_at").order("created_at", { ascending: false }),
    ]);
    const err = g.error?.message || d.error?.message || "";
    setLoadError(err);
    if (g.data) {
      setGoals(
        g.data.map((x) => ({
          ...x,
          target: Number(x.target),
          recurring_amount: x.recurring_amount == null ? null : Number(x.recurring_amount),
        })) as Goal[],
      );
    }
    if (d.data) setDeposits(d.data.map((x) => ({ ...x, amount: Number(x.amount) })) as Deposit[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    let alive = true;
    load().then(async () => {
      // Faz os depósitos automáticos que venceram desde a última vez
      const created = await runRecurrences();
      if (alive && created) load();
    });
    return () => {
      alive = false;
    };
  }, [load]);

  const savedOf = (id: string) => deposits.filter((d) => d.goal_id === id).reduce((s, d) => s + d.amount, 0);

  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const totalSaved = goals.reduce((s, g) => s + Math.min(savedOf(g.id), g.target), 0);
  const overall = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
  const doneCount = goals.filter((g) => savedOf(g.id) >= g.target).length;

  const visible = goals.filter((g) => {
    const done = savedOf(g.id) >= g.target;
    if (filter === "andamento") return !done;
    if (filter === "concluidas") return done;
    return true;
  });

  async function onRefresh() {
    setRefreshing(true);
    await load();
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
          <Text style={styles.title}>Metas</Text>
          <Pressable onPress={() => setModalOpen(true)}>
            <LinearGradient
              colors={[colors.primary, colors.roseDeep]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.newBtn, shadowGlow]}
            >
              <Plus size={16} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>Nova</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Dashboard geral */}
        <LinearGradient
          colors={[colors.primary, colors.roseDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, shadowGlow]}
        >
          <Ring percent={overall} size={104} stroke={10} color="#fff" trackColor="rgba(255,255,255,0.22)">
            <Text style={{ color: "#fff", fontSize: 24, fontWeight: "700" }}>{Math.round(overall)}%</Text>
          </Ring>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>Total guardado</Text>
            <Text numberOfLines={1} style={{ color: "#fff", fontSize: 24, fontWeight: "700" }}>
              {formatMoney(totalSaved)}
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 4 }}>
              de {formatMoney(totalTarget)} · {doneCount} de {goals.length} concluída
              {goals.length === 1 ? "" : "s"}
            </Text>
          </View>
        </LinearGradient>

        <View style={{ marginTop: 18 }}>
          <Segmented<Filter>
            value={filter}
            onChange={setFilter}
            options={[
              { key: "todas", label: "Todas" },
              { key: "andamento", label: "Em andamento" },
              { key: "concluidas", label: "Concluídas" },
            ]}
          />
        </View>

        <ErrorText>{loadError ? `Não foi possível carregar: ${loadError}` : ""}</ErrorText>

        {!loading && visible.length === 0 ? (
          <EmptyBox>
            {goals.length === 0
              ? 'Nenhuma meta ainda. Toque em "Nova" para criar a primeira.'
              : "Nenhuma meta nesta aba."}
          </EmptyBox>
        ) : (
          <View style={{ gap: 16, marginTop: 18 }}>
            {visible.map((g) => (
              <GoalCard
                key={g.id}
                goal={g}
                saved={savedOf(g.id)}
                deposits={deposits.filter((d) => d.goal_id === g.id)}
                open={openId === g.id}
                onToggle={() => setOpenId(openId === g.id ? null : g.id)}
                onChanged={load}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <NewGoalModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setModalOpen(false);
          load();
        }}
      />
    </View>
  );
}

function GoalCard({
  goal,
  saved,
  deposits,
  open,
  onToggle,
  onChanged,
}: {
  goal: Goal;
  saved: number;
  deposits: Deposit[];
  open: boolean;
  onToggle: () => void;
  onChanged: () => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const [custom, setCustom] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const percent = goal.target > 0 ? (saved / goal.target) * 100 : 0;
  const done = saved >= goal.target;
  const remaining = Math.max(0, goal.target - saved);
  const auto = !!goal.recurrence && goal.recurrence !== "none" && !!goal.recurring_amount && !done;

  let hint = "";
  if (done) {
    hint = "Meta concluída!";
  } else if (goal.deadline) {
    const m = monthsLeft(goal.deadline);
    hint =
      m === 0
        ? "Prazo vencido"
        : `Guarde ${formatMoney(remaining / m)}/mês por ${m} ${m === 1 ? "mês" : "meses"}`;
  }

  async function addDeposit(value: number) {
    setError("");
    if (!value) return;
    if (saved + value < 0) return setError("Você não tem tudo isso guardado.");
    setBusy(true);
    const { error } = await supabase.from("goal_deposits").insert({ goal_id: goal.id, amount: value });
    setBusy(false);
    if (error) return setError(error.message);
    setCustom(0);
    onChanged();
  }

  async function stopAuto() {
    const { error } = await supabase.from("goals").update({ recurrence: "none" }).eq("id", goal.id);
    if (error) showError(error.message);
    else onChanged();
  }

  function confirmDelete() {
    confirmAction("Apagar meta", `Apagar a meta "${goal.name}" e o histórico dela?`, "Apagar", async () => {
      const { error } = await supabase.from("goals").delete().eq("id", goal.id);
      if (error) showError(error.message);
      else onChanged();
    });
  }

  return (
    <View style={styles.goalCard}>
      <Pressable onPress={onToggle} style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <Ring percent={percent} size={64} stroke={7} color={colors.primary} trackColor={colors.secondary}>
          {done ? (
            <Trophy size={26} color={colors.primary} />
          ) : (
            <GoalIcon name={goal.emoji} size={26} color={colors.primary} />
          )}
        </Ring>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>
            {goal.name}
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted, marginTop: 1 }}>
            {formatMoney(saved)} de {formatMoney(goal.target)}
          </Text>
          <View style={styles.track}>
            <View
              style={{
                height: "100%",
                borderRadius: 999,
                backgroundColor: colors.primary,
                width: `${Math.min(100, Math.max(0, percent))}%`,
              }}
            />
          </View>
        </View>
        <Text style={{ fontSize: 14, fontWeight: "700", color: colors.primary }}>
          {Math.round(Math.max(0, percent))}%
        </Text>
      </Pressable>

      {hint ? (
        <View style={[styles.hint, { backgroundColor: done ? colors.secondary : colors.accent }]}>
          {done && <Trophy size={14} color={colors.primary} />}
          <Text style={{ fontSize: 12, fontWeight: "500", color: done ? colors.primary : colors.accentForeground }}>
            {hint}
          </Text>
        </View>
      ) : null}

      {auto ? (
        <View style={[styles.hint, { backgroundColor: colors.secondary, marginTop: 8 }]}>
          <Repeat size={14} color={colors.primary} />
          <Text style={{ flex: 1, fontSize: 12, fontWeight: "500", color: colors.primary }}>
            Guardando {formatMoney(goal.recurring_amount ?? 0)} {recurrencePer(goal.recurrence)} automaticamente
          </Text>
        </View>
      ) : null}

      {open && (
        <View style={styles.expanded}>
          <Text style={styles.sectionLabel}>Guardar rápido</Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
            {[50, 100, 200, 500].map((v) => (
              <Pressable
                key={v}
                disabled={busy}
                onPress={() => addDeposit(v)}
                style={[styles.quick, busy && { opacity: 0.6 }]}
              >
                <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 13 }}>+{v}</Text>
              </Pressable>
            ))}
          </View>

          <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
            <MoneyInput compact style={{ flex: 1 }} value={custom} onChange={setCustom} placeholder="Outro valor" />
            <Pressable
              disabled={busy}
              onPress={() => addDeposit(custom)}
              style={[styles.smallBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>Guardar</Text>
            </Pressable>
            <Pressable
              disabled={busy}
              onPress={() => addDeposit(-custom)}
              style={[styles.smallBtn, { backgroundColor: colors.accent }]}
            >
              <Text style={{ color: colors.accentForeground, fontWeight: "700", fontSize: 12 }}>Retirar</Text>
            </Pressable>
          </View>
          <ErrorText>{error}</ErrorText>

          {auto && (
            <Pressable onPress={stopAuto} style={{ marginTop: 14 }}>
              <Text style={{ color: colors.primary, fontWeight: "600", fontSize: 12 }}>
                Parar de guardar automaticamente
              </Text>
            </Pressable>
          )}

          <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Histórico</Text>
          {deposits.length === 0 ? (
            <Text style={{ fontSize: 12, color: colors.muted, marginTop: 8 }}>Nenhum depósito ainda.</Text>
          ) : (
            <View style={{ marginTop: 8, gap: 6 }}>
              {deposits.slice(0, 10).map((d) => {
                const dt = new Date(d.created_at);
                const label = `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
                return (
                  <View key={d.id} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 12, color: colors.muted }}>{label}</Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: d.amount > 0 ? colors.primary : colors.foreground,
                      }}
                    >
                      {d.amount > 0 ? "+" : "-"}
                      {formatMoney(Math.abs(d.amount))}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          <Pressable onPress={confirmDelete} style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 18 }}>
            <Trash2 size={14} color={colors.destructive} />
            <Text style={{ color: colors.destructive, fontWeight: "600", fontSize: 12 }}>Apagar meta</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function NewGoalModal({
  visible,
  onClose,
  onSaved,
}: {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(iconKeys[0]);
  const [target, setTarget] = useState(0);
  const [deadline, setDeadline] = useState("");
  const [frequency, setFrequency] = useState<Recurrence>("none");
  const [autoAmount, setAutoAmount] = useState(0);
  const [autoStart, setAutoStart] = useState(todayStr());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setName("");
      setIcon(iconKeys[0]);
      setTarget(0);
      setDeadline("");
      setFrequency("none");
      setAutoAmount(0);
      setAutoStart(todayStr());
      setError("");
      setSaving(false);
    }
  }, [visible]);

  async function handleSave() {
    setError("");
    const value = Math.round(target * 100) / 100;
    if (!name.trim()) return setError("Dê um nome para a meta.");
    if (!value || value <= 0) return setError("Digite um valor maior que zero.");
    if (deadline && deadline < todayStr()) return setError("O prazo precisa ser uma data futura.");
    if (frequency !== "none" && (!autoAmount || autoAmount <= 0)) {
      return setError("Digite quanto guardar a cada repetição.");
    }

    const row: Record<string, unknown> = {
      name: name.trim(),
      emoji: icon,
      target: value,
      deadline: deadline || null,
    };
    if (frequency !== "none") {
      row.recurrence = frequency;
      row.recurring_amount = Math.round(autoAmount * 100) / 100;
      row.recurrence_start = autoStart;
    }

    setSaving(true);
    const { error } = await supabase.from("goals").insert(row);
    if (error) {
      setSaving(false);
      return setError(
        frequency !== "none"
          ? `Não foi possível salvar a repetição (rodou o SQL no Supabase?): ${error.message}`
          : error.message,
      );
    }
    if (frequency !== "none") await runRecurrences();
    setSaving(false);
    onSaved();
  }

  return (
    <Sheet visible={visible} title="Nova meta" onClose={onClose}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {iconKeys.map((k) => (
          <Pressable
            key={k}
            onPress={() => setIcon(k)}
            style={[
              styles.iconBtn,
              icon === k
                ? { backgroundColor: colors.secondary, borderWidth: 2, borderColor: colors.primary }
                : { backgroundColor: colors.secondary },
            ]}
          >
            <GoalIcon name={k} size={22} color={colors.primary} />
          </Pressable>
        ))}
      </View>

      <View style={{ gap: 12, marginTop: 16 }}>
        <Input placeholder="Nome (ex: Viagem)" value={name} onChangeText={setName} />
        <MoneyInput value={target} onChange={setTarget} placeholder="Valor da meta" />
        <DateField label="Prazo (opcional)" value={deadline} onChange={setDeadline} optional placeholder="Sem prazo" />
      </View>

      <FieldLabel style={{ marginTop: 18 }}>Guardar automaticamente</FieldLabel>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {[{ key: "none" as Recurrence, label: "Não" }, ...recurrenceOptions].map((o) => (
          <Chip key={o.key} label={o.label} active={frequency === o.key} onPress={() => setFrequency(o.key)} />
        ))}
      </View>

      {frequency !== "none" && (
        <View style={{ gap: 12, marginTop: 14 }}>
          <MoneyInput value={autoAmount} onChange={setAutoAmount} placeholder="Quanto guardar a cada vez" />
          <DateField label="Primeiro depósito em" value={autoStart} onChange={setAutoStart} />
          <Text style={{ fontSize: 12, color: colors.muted }}>
            O app guarda esse valor {recurrencePer(frequency)} sozinho, começando em {isoToBr(autoStart)}, até a meta ser
            concluída.
          </Text>
        </View>
      )}

      <ErrorText>{error}</ErrorText>

      <View style={{ marginTop: 20 }}>
        <PrimaryButton label="Criar meta" onPress={handleSave} loading={saving} />
      </View>
    </Sheet>
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
    hero: {
      marginTop: 18,
      borderRadius: radius.xxl,
      padding: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 18,
    },
    goalCard: {
      backgroundColor: colors.card,
      borderRadius: radius.xxl,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      ...shadowCard,
    },
    track: {
      marginTop: 8,
      height: 8,
      borderRadius: 999,
      backgroundColor: colors.secondary,
      overflow: "hidden",
    },
    hint: {
      marginTop: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderRadius: radius.sm,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    expanded: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    sectionLabel: { fontSize: 12, fontWeight: "600", color: colors.muted },
    quick: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 9,
      borderRadius: radius.sm,
      backgroundColor: colors.secondary,
    },
    smallBtn: {
      paddingHorizontal: 12,
      borderRadius: radius.sm,
      alignItems: "center",
      justifyContent: "center",
    },
    iconBtn: {
      width: 46,
      height: 46,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
    },
  });
