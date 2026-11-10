import { PiggyBank, Repeat, TrendingDown, TrendingUp } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { DateField } from "./DateField";
import { MoneyInput } from "./MoneyInput";
import { Chip, ErrorText, Input, PrimaryButton, Segmented, Sheet } from "./ui";
import { isoToBr, todayStr } from "../lib/format";
import { recurrenceOptions, runRecurrences } from "../lib/recurrence";
import { supabase } from "../lib/supabase";
import { useTheme } from "../lib/settings";
import { radius } from "../lib/theme";
import { categories, type Recurrence, type Transaction } from "../lib/types";

export type Tipo = "saida" | "entrada" | "recorrente" | "meta";
type RecurringKind = "saida" | "entrada";
type GoalOption = { id: string; name: string };

const tipos: { key: Tipo; label: string; icon: typeof Repeat }[] = [
  { key: "saida", label: "Gasto", icon: TrendingDown },
  { key: "entrada", label: "Entrada", icon: TrendingUp },
  { key: "recorrente", label: "Recorrente", icon: Repeat },
  { key: "meta", label: "Meta", icon: PiggyBank },
];

export function TransactionModal({
  visible,
  transaction,
  initialTipo = "saida",
  onClose,
  onSaved,
}: {
  visible: boolean;
  transaction: Transaction | null; // null = novo lançamento
  initialTipo?: Tipo;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { colors } = useTheme();
  const labelStyle = { marginTop: 16, marginBottom: 8, fontSize: 12, fontWeight: "600", color: colors.muted } as const;
  const [tipo, setTipo] = useState<Tipo>("saida");
  const [recKind, setRecKind] = useState<RecurringKind>("saida");
  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(todayStr());
  const [frequency, setFrequency] = useState<Recurrence>("monthly");
  const [endDate, setEndDate] = useState("");
  const [goals, setGoals] = useState<GoalOption[]>([]);
  const [goalId, setGoalId] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const editing = transaction !== null;
  const isTemplate = !!transaction && !!transaction.recurrence && transaction.recurrence !== "none";

  // Preenche o formulário toda vez que o modal abre
  useEffect(() => {
    if (!visible) return;
    setError("");
    setSaving(false);
    setEndDate("");
    setGoalId("");
    if (transaction) {
      const kind: RecurringKind = transaction.amount < 0 ? "saida" : "entrada";
      const tpl = !!transaction.recurrence && transaction.recurrence !== "none";
      setTipo(tpl ? "recorrente" : kind);
      setRecKind(kind);
      setName(transaction.name);
      setCategory(transaction.category);
      setAmount(Math.abs(transaction.amount));
      setDate(transaction.date);
      setFrequency(tpl ? (transaction.recurrence as Recurrence) : "monthly");
      setEndDate(transaction.recurrence_end ?? "");
    } else {
      setTipo(initialTipo);
      setRecKind("saida");
      setName("");
      setCategory(initialTipo === "entrada" ? "Entradas" : categories[0]);
      setAmount(0);
      setDate(todayStr());
      setFrequency(initialTipo === "meta" ? "none" : "monthly");
    }
  }, [visible, transaction, initialTipo]);

  // Carrega as metas quando o tipo "Meta" é escolhido
  useEffect(() => {
    if (!visible || tipo !== "meta" || editing) return;
    supabase
      .from("goals")
      .select("id, name")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const list = (data ?? []) as GoalOption[];
        setGoals(list);
        setGoalId((cur) => cur || list[0]?.id || "");
      });
  }, [visible, tipo, editing]);

  function chooseTipo(next: Tipo) {
    setTipo(next);
    setError("");
    if (next === "entrada") setCategory("Entradas");
    else if (next === "saida" && category === "Entradas") setCategory(categories[0]);
    if (next === "meta") setFrequency("none");
    if (next === "recorrente" && frequency === "none") setFrequency("monthly");
  }

  const effKind: RecurringKind = tipo === "recorrente" ? recKind : tipo === "entrada" ? "entrada" : "saida";

  async function handleSave() {
    setError("");
    const value = Math.round(amount * 100) / 100;
    if (!value || value <= 0) return setError("Digite um valor maior que zero.");
    if (!date) return setError("Escolha uma data.");

    // ---------- Meta: guarda dinheiro numa meta ----------
    if (tipo === "meta") {
      if (!goalId) return setError("Escolha a meta. Se ainda não tem nenhuma, crie na aba Metas.");
      const today = todayStr();
      if (date > today && frequency === "none") {
        return setError("Data futura só funciona com repetição. Escolha Semanal, Mensal ou Anual.");
      }
      setSaving(true);
      if (date <= today) {
        const { error } = await supabase
          .from("goal_deposits")
          .insert({ goal_id: goalId, amount: value, created_at: `${date}T12:00:00` });
        if (error) {
          setSaving(false);
          return setError(error.message);
        }
      }
      if (frequency !== "none") {
        const { error } = await supabase
          .from("goals")
          .update({
            recurrence: frequency,
            recurring_amount: value,
            recurrence_start: date,
            last_run: date <= today ? date : null,
          })
          .eq("id", goalId);
        if (error) {
          setSaving(false);
          return setError(`Não foi possível repetir (rodou o SQL no Supabase?): ${error.message}`);
        }
        await runRecurrences();
      }
      setSaving(false);
      return onSaved();
    }

    // ---------- Gasto, entrada ou recorrente ----------
    if (!name.trim()) return setError("Digite um nome para o lançamento.");
    if (tipo === "recorrente" && endDate && endDate <= date) {
      return setError("A data final precisa ser depois da data de início.");
    }

    setSaving(true);
    const row: Record<string, unknown> = {
      name: name.trim(),
      category,
      amount: effKind === "saida" ? -value : value,
    };
    if (!isTemplate) row.date = date;
    if (tipo === "recorrente") {
      row.recurrence = frequency;
      row.recurrence_end = endDate || null;
      if (!editing) row.last_run = date;
    }

    const { error } = transaction
      ? await supabase.from("transactions").update(row).eq("id", transaction.id)
      : await supabase.from("transactions").insert(row);

    if (error) {
      setSaving(false);
      return setError(
        tipo === "recorrente"
          ? `Não foi possível salvar a recorrência (rodou o SQL no Supabase?): ${error.message}`
          : error.message,
      );
    }
    if (tipo === "recorrente") await runRecurrences();
    setSaving(false);
    onSaved();
  }

  const showFrequency = tipo === "recorrente" || tipo === "meta";
  const freqOptions: { key: Recurrence; label: string }[] =
    tipo === "meta"
      ? [{ key: "none", label: "Não repete" }, ...recurrenceOptions]
      : recurrenceOptions.map((o) => ({ key: o.key, label: o.label }));

  return (
    <Sheet visible={visible} title={editing ? "Editar lançamento" : "Novo lançamento"} onClose={onClose}>
      {/* 4 tipos de lançamento */}
      {!editing && (
        <View style={{ flexDirection: "row", gap: 8 }}>
          {tipos.map((t) => {
            const active = tipo === t.key;
            return (
              <Pressable
                key={t.key}
                onPress={() => chooseTipo(t.key)}
                style={{
                  flex: 1,
                  alignItems: "center",
                  gap: 6,
                  paddingVertical: 12,
                  borderRadius: radius.md,
                  backgroundColor: active ? colors.primary : colors.secondary,
                }}
              >
                <t.icon size={20} color={active ? "#fff" : colors.primary} />
                <Text style={{ fontSize: 11, fontWeight: "700", color: active ? "#fff" : colors.accentForeground }}>
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {tipo === "recorrente" && (
        <View style={{ marginTop: 14 }}>
          <Segmented<RecurringKind>
            value={recKind}
            onChange={(k) => {
              setRecKind(k);
              if (k === "entrada") setCategory("Entradas");
              else if (category === "Entradas") setCategory(categories[0]);
            }}
            options={[
              { key: "saida", label: "É um gasto" },
              { key: "entrada", label: "É uma entrada" },
            ]}
          />
        </View>
      )}

      {tipo === "meta" && !editing && (
        <>
          <Text style={labelStyle}>Meta</Text>
          {goals.length === 0 ? (
            <Text style={{ fontSize: 13, color: colors.muted }}>
              Você ainda não tem metas. Crie uma na aba Metas e volte aqui.
            </Text>
          ) : (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {goals.map((g) => (
                <Chip key={g.id} label={g.name} active={goalId === g.id} onPress={() => setGoalId(g.id)} />
              ))}
            </View>
          )}
        </>
      )}

      <View style={{ gap: 12, marginTop: 16 }}>
        {tipo !== "meta" && (
          <Input
            placeholder={tipo === "entrada" || effKind === "entrada" ? "Nome (ex: Salário)" : "Nome (ex: Mercado)"}
            value={name}
            onChangeText={setName}
          />
        )}
        <MoneyInput value={amount} onChange={setAmount} />
        {isTemplate ? (
          <Text style={{ fontSize: 13, color: colors.muted }}>Começou em {isoToBr(date)}</Text>
        ) : (
          <DateField
            value={date}
            onChange={setDate}
            label={tipo === "recorrente" || tipo === "meta" ? "Data de início" : "Data"}
          />
        )}
      </View>

      {showFrequency && (
        <>
          <Text style={labelStyle}>{tipo === "meta" ? "Repetir" : "Frequência"}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {freqOptions.map((o) => (
              <Chip key={o.key} label={o.label} active={frequency === o.key} onPress={() => setFrequency(o.key)} />
            ))}
          </View>
          {tipo === "meta" && frequency !== "none" && (
            <Text style={{ marginTop: 8, fontSize: 12, color: colors.muted }}>
              O app guarda esse valor na meta automaticamente até ela ser concluída.
            </Text>
          )}
        </>
      )}

      {tipo === "recorrente" && (
        <View style={{ marginTop: 16 }}>
          <DateField label="Termina em (opcional)" value={endDate} onChange={setEndDate} optional placeholder="Sem data final" />
        </View>
      )}

      {tipo !== "meta" && (
        <>
          <Text style={labelStyle}>Categoria</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {categories.map((c) => (
              <Chip key={c} label={c} active={category === c} onPress={() => setCategory(c)} />
            ))}
          </View>
        </>
      )}

      <ErrorText>{error}</ErrorText>

      <View style={{ marginTop: 20 }}>
        <PrimaryButton
          label={editing ? "Salvar alterações" : tipo === "meta" ? "Guardar na meta" : "Salvar"}
          onPress={handleSave}
          loading={saving}
        />
      </View>
    </Sheet>
  );
}
