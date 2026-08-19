import { LedgerEntry } from "@/hooks/useLedger";
import { formatDateGroupLabel, localDateKey } from "@/lib/format";

export type LedgerRow =
  | { kind: "header"; key: string; label: string; net: number }
  | { kind: "entry"; key: string; entry: LedgerEntry };

export function groupEntries(entries: LedgerEntry[]): LedgerRow[] {
  const groups = new Map<string, { label: string; items: LedgerEntry[] }>();

  for (const entry of entries) {
    const key = localDateKey(entry.date);
    const existing = groups.get(key);
    if (existing) {
      existing.items.push(entry);
    } else {
      groups.set(key, {
        label: formatDateGroupLabel(entry.date),
        items: [entry],
      });
    }
  }

  const rows: LedgerRow[] = [];
  for (const [key, group] of groups) {
    const net = group.items.reduce(
      (sum, entry) => sum + (entry.type === "INCOME" ? entry.amount : -entry.amount),
      0,
    );
    rows.push({ kind: "header", key: `h-${key}`, label: group.label, net });
    for (const entry of group.items) {
      rows.push({ kind: "entry", key: entry.id, entry });
    }
  }

  return rows;
}