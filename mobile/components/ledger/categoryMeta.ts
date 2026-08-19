import { Ionicons } from "@expo/vector-icons";

type IoniconName = keyof typeof Ionicons.glyphMap;

export const CATEGORY_ICONS: Record<string, IoniconName> = {
  Groceries: "cart",
  Dining: "restaurant",
  Transport: "car",
  Entertainment: "film",
  Shopping: "bag-handle",
  Subscriptions: "repeat",
  Utilities: "flash",
  Health: "medical",
  Education: "school",
  Travel: "airplane",
  Housing: "home",
  Salary: "cash",
  Freelance: "desktop",
  Investments: "trending-up",
  Gifts: "gift",
  Refunds: "return-down-back",
  Other: "ellipsis-horizontal-circle",
};

export function getCategoryIcon(category: string): IoniconName {
  return CATEGORY_ICONS[category] ?? "ellipsis-horizontal-circle";
}

const CATEGORY_COLORS: Record<string, string> = {
  Groceries: "#22C55E",
  Dining: "#F59E0B",
  Transport: "#3B82F6",
  Entertainment: "#A855F7",
  Shopping: "#EC4899",
  Subscriptions: "#14B8A6",
  Utilities: "#EAB308",
  Health: "#EF4444",
  Education: "#6366F1",
  Travel: "#0EA5E9",
  Housing: "#84CC16",
  Salary: "#22C55E",
  Freelance: "#14B8A6",
  Investments: "#10B981",
  Gifts: "#F472B6",
  Refunds: "#38BDF8",
  Other: "#94A3B8",
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? "#94A3B8";
}