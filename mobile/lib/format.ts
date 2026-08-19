export type EntryType = "INCOME" | "EXPENSE";

function pad(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

export function formatCurrency(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  const [int, dec] = Math.abs(amount).toFixed(2).split(".");
  const withSeparators = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${sign}$${withSeparators}.${dec}`;
}

export function formatSignedCurrency(
  amount: number,
  type: EntryType,
): string {
  const prefix = type === "EXPENSE" ? "-" : "+";
  return `${prefix}${formatCurrency(amount)}`;
}

export function localDateKey(dateIso: string | Date): string {
  const date = typeof dateIso === "string" ? new Date(dateIso) : dateIso;
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatDateShort(dateIso: string | Date): string {
  const date = typeof dateIso === "string" ? new Date(dateIso) : dateIso;
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return sameYear
    ? `${MONTHS[date.getMonth()]} ${date.getDate()}`
    : `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function formatDateGroupLabel(dateIso: string | Date): string {
  const date = typeof dateIso === "string" ? new Date(dateIso) : dateIso;
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (localDateKey(date) === localDateKey(today)) return "Today";
  if (localDateKey(date) === localDateKey(yesterday)) return "Yesterday";

  const sameYear = date.getFullYear() === today.getFullYear();
  return sameYear
    ? `${MONTHS[date.getMonth()]} ${date.getDate()}`
    : `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function toISODateString(date: Date): string {
  return date.toISOString();
}

export function startOfLocalMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export function startOfTomorrow(): Date {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return tomorrow;
}