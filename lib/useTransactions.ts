import { useCallback, useEffect, useState } from "react";
import { runRecurrences } from "./recurrence";
import { supabase } from "./supabase";
import type { Transaction } from "./types";

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    // "*" traz também as colunas novas de recorrência quando elas existirem
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setError("");
      setTransactions((data ?? []).map((t) => ({ ...t, amount: Number(t.amount) })) as Transaction[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let alive = true;
    reload().then(async () => {
      // Gera os lançamentos recorrentes que venceram desde a última vez que o app abriu
      const created = await runRecurrences();
      if (alive && created) reload();
    });
    return () => {
      alive = false;
    };
  }, [reload]);

  return { transactions, loading, error, reload };
}
