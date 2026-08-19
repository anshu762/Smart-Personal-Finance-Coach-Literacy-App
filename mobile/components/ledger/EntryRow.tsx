import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { Card } from "@/components/ui";
import {
  formatSignedCurrency,
  formatDateShort,
  type EntryType,
} from "@/lib/format";
import { getCategoryIcon, getCategoryColor } from "./categoryMeta";

export interface EntryRowProps {
  id: string;
  type: EntryType;
  category: string;
  amount: number;
  note: string | null;
  date: string;
  onPress: () => void;
  onDelete: () => void;
}

export function EntryRow({
  type,
  category,
  amount,
  note,
  date,
  onPress,
  onDelete,
}: EntryRowProps) {
  const isExpense = type === "EXPENSE";
  const color = isExpense ? "#EF4444" : "#22C55E";

  return (
    <Card padded={false} className="mb-2 overflow-hidden">
      <Pressable
        onPress={onPress}
        className="flex-row items-center px-3 py-3 active:bg-slate-800"
        accessibilityRole="button"
      >
        <View
          className="mr-3 h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: `${getCategoryColor(category)}22` }}
        >
          <Ionicons
            name={getCategoryIcon(category)}
            size={20}
            color={getCategoryColor(category)}
          />
        </View>

        <View className="flex-1">
          <Text className="text-base font-medium text-white">{category}</Text>
          {note ? (
            <Text className="mt-0.5 text-xs text-muted" numberOfLines={1}>
              {note}
            </Text>
          ) : null}
          <Text className="mt-0.5 text-xs text-muted">
            {formatDateShort(date)}
          </Text>
        </View>

        <Text
          className="text-base font-semibold"
          style={{ color }}
        >
          {formatSignedCurrency(amount, type)}
        </Text>

        <Pressable
          onPress={onDelete}
          hitSlop={8}
          className="ml-3 p-1"
          accessibilityRole="button"
          accessibilityLabel={`Delete ${category} entry`}
        >
          <Ionicons name="trash-outline" size={18} color="#94A3B8" />
        </Pressable>
      </Pressable>
    </Card>
  );
}