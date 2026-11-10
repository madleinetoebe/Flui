import { parseDate, toISO, todayStr } from "./format";
import { supabase } from "./supabase";
import type { Recurrence } from "./types";

export const recurrenceOptions: { key: Exclude<Recurrence, "none">; label: string; per: string }[] = [
  { key: "weekly", label: "Semanal", per: "por semana" },
  { key: "monthly", label: "Mensal", per: "por mês" },
  { key: "yearly", label: "Anual", per: "por ano" },
];

export function recurrenceLabel(r?: string | null) {
  return recurrenceOptions.find((o) => o.key === r)?.label ?? "";
}

export function recurrencePer(r?: string | null) {
  return recurrenceOptions.find((o) => o.key === r)?.per ?? "";
}

// Data da k-ésima repetição a partir da data de início (k = 0 é o próprio início).
// Mensal/anual respeitam fim de mês: dia 31 vira 30 (ou 28/29) quando o mês é menor.
export function occurrence(start: string, rec: Recurrence, k: number) {
  const d = parseDate(start);
  if (rec === "weekly") {
    d.setDate(d.getDate() + 7 * k);
    return toISO(d);
  }
  const months = rec === "yearly" ? 12 * k : k;
  const first = new Date(d.getFullYear(), d.getMonth() + months, 1);
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  return toISO(new Date(first.getFullYear(), first.getMonth(), Math.min(d.getDate(), daysInMonth)));
}

// Datas que já deveriam ter acontecido e ainda não foram geradas.
export function dueDates(
  start: string,
  rec: Recurrence,
  lastRun: string | null,
  end: string | null,
  today: string,
) {
  const out: string[] = [];
  for (let k = 0; k < 3000 && out.length < 120; k++) {
    const d = occurrence(start, rec, k);
    if (d > today || (end && d > end)) break;
    if (lastRun && d <= lastRun) continue;
    out.push(d);
  }
  return out;
}

// Cria os lançamentos e depósitos recorrentes que estão pendentes.
// Roda ao abrir o app e depois de salvar uma recorrência. Se o SQL ainda não foi
// executado no Supabase, as consultas dão erro e a função simplesmente não faz nada.
// Devolve true quando criou algo novo (aí a tela precisa recarregar a lista).
// Duas chamadas ao mesmo tempo viram uma só, para nunca criar lançamento em dobro.
let inFlight: Promise<boolean> | null = null;

export function runRecurrences(): Promise<boolean> {
  if (!inFlight) {
    inFlight = doRun().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

async function doRun(): Promise<boolean> {
  const today = todayStr();
  let changed = false;
  try {
    // 1) Gastos e entradas recorrentes
    const tpl = await supabase.from("transactions").select("*").neq("recurrence", "none");
    if (!tpl.error && tpl.data) {
      for (const t of tpl.data) {
        const due = dueDates(t.date, t.recurrence, t.last_run ?? t.date, t.recurrence_end ?? null, today);
        if (!due.length) continue;
        const rows = due.map((date) => ({
          name: t.name,
          category: t.category,
          amount: Number(t.amount),
          date,
          parent_id: t.id,
        }));
        const ins = await supabase.from("transactions").insert(rows);
        if (!ins.error) {
          changed = true;
          await supabase.from("transactions").update({ last_run: due[due.length - 1] }).eq("id", t.id);
        }
      }
    }

    // 2) Depósitos automáticos nas metas
    const goals = await supabase.from("goals").select("*").neq("recurrence", "none");
    if (!goals.error && goals.data && goals.data.length) {
      const deps = await supabase.from("goal_deposits").select("goal_id, amount");
      for (const g of goals.data) {
        if (!g.recurrence_start || !g.recurring_amount) continue;
        const due = dueDates(g.recurrence_start, g.recurrence, g.last_run ?? null, null, today);
        if (!due.length) continue;

        let saved = (deps.data ?? [])
          .filter((d) => d.goal_id === g.id)
          .reduce((s, d) => s + Number(d.amount), 0);
        const amount = Number(g.recurring_amount);
        const rows: { goal_id: string; amount: number; created_at: string }[] = [];
        for (const date of due) {
          if (saved >= Number(g.target)) break;
          rows.push({ goal_id: g.id, amount, created_at: `${date}T12:00:00` });
          saved += amount;
        }
        if (rows.length) {
          const ins = await supabase.from("goal_deposits").insert(rows);
          if (ins.error) continue;
          changed = true;
        }
        // Meta batida: para de guardar automaticamente
        const patch: { last_run: string; recurrence?: string } = { last_run: due[due.length - 1] };
        if (saved >= Number(g.target)) patch.recurrence = "none";
        await supabase.from("goals").update(patch).eq("id", g.id);
      }
    }
  } catch {
    // sem internet ou sem as colunas novas: segue sem recorrência
  }
  return changed;
}
