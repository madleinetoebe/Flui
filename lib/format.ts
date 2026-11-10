// Funções de formatação feitas à mão (sem Intl) para funcionar igual em todo celular.

const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];
const MONTHS_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

// ----- Moeda (configurável em Perfil > Configurações) -----
// Só troca o símbolo e o jeito de escrever o número. Os valores não são convertidos.
export type Currency = "BRL" | "USD" | "EUR";

export const currencies: { key: Currency; label: string; symbol: string }[] = [
  { key: "BRL", label: "Real (R$)", symbol: "R$" },
  { key: "USD", label: "Dólar (US$)", symbol: "US$" },
  { key: "EUR", label: "Euro (€)", symbol: "€" },
];

let currentCurrency: Currency = "BRL";

export function setCurrency(c: Currency) {
  currentCurrency = c;
}

export function currencySymbol() {
  return currencies.find((c) => c.key === currentCurrency)?.symbol ?? "R$";
}

// 1234.5 -> "1.234,50" (BRL/EUR) ou "1,234.50" (USD)
export function formatNumber(value: number) {
  const [int, dec] = Math.abs(value).toFixed(2).split(".");
  if (currentCurrency === "USD") return `${int.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${dec}`;
  return `${int.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${dec}`;
}

export function formatMoney(value: number) {
  const s = `${currencySymbol()} ${formatNumber(value)}`;
  return value < 0 ? `-${s}` : s;
}

// nome antigo, mantido para não quebrar as telas
export const formatBRL = formatMoney;

export function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayStr() {
  return toISO(new Date());
}

export function parseDate(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function dateLabel(s: string, relative = true) {
  if (relative) {
    const diff = Math.round((parseDate(todayStr()).getTime() - parseDate(s).getTime()) / 86400000);
    if (diff === 0) return "Hoje";
    if (diff === 1) return "Ontem";
  }
  const d = parseDate(s);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

export function shiftMonth(ym: string, delta: number) {
  const [y, m] = ym.split("-").map(Number);
  return toISO(new Date(y, m - 1 + delta, 1)).slice(0, 7);
}

export function monthLabel(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return `${MONTHS[m - 1]} de ${y}`;
}

export function monthName(d = new Date()) {
  return MONTHS[d.getMonth()];
}

export function weekdayLetter(d: Date) {
  return WEEKDAYS[d.getDay()];
}

export function monthsLeft(deadline: string) {
  const days = (parseDate(deadline).getTime() - Date.now()) / 86400000;
  return days <= 0 ? 0 : Math.max(1, Math.ceil(days / 30));
}

// "25,90" -> 25.9 | "1.500,50" -> 1500.5 | "25.90" -> 25.9
export function parseAmount(s: string) {
  const t = s.trim();
  const normalized = t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t;
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : 0;
}

// Máscara DD/MM/AAAA enquanto digita
export function maskDate(s: string) {
  const digits = s.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function isoToBr(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// "25/12/2026" -> "2026-12-25" (ou null se for inválida)
export function brToIso(br: string) {
  const m = br.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const d = Number(m[1]);
  const mo = Number(m[2]);
  const y = Number(m[3]);
  const date = new Date(y, mo - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
