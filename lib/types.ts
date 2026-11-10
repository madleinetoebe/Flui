export type Tab = "inicio" | "gastos" | "metas" | "perfil";

export type Recurrence = "none" | "weekly" | "monthly" | "yearly";

export type Transaction = {
  id: string;
  name: string;
  category: string;
  amount: number; // positivo = entrada, negativo = saída
  date: string; // AAAA-MM-DD
  recurrence?: Recurrence | null; // só o lançamento "modelo" de uma recorrência tem isso
  recurrence_end?: string | null;
  last_run?: string | null;
  parent_id?: string | null; // lançamentos gerados automaticamente apontam para o modelo
};

export type Goal = {
  id: string;
  name: string;
  emoji: string; // guarda o nome do ícone (ex: "plane")
  target: number;
  deadline: string | null; // AAAA-MM-DD
  recurrence?: Recurrence | null; // depósito automático
  recurring_amount?: number | null;
  recurrence_start?: string | null;
  last_run?: string | null;
};

export type Deposit = {
  id: string;
  goal_id: string;
  amount: number;
  created_at: string;
};

export const categories = [
  "Alimentação",
  "Transporte",
  "Compras",
  "Moradia",
  "Lazer",
  "Saúde",
  "Entradas",
  "Outros",
];
