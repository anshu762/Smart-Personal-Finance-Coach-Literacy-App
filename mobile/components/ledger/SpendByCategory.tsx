import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { Card } from "@/components/ui";
import { getCategoryColor, getCategoryIcon } from "./categoryMeta";
import { formatCurrency } from "@/lib/format";

export interface SpendByCategoryProps {
  categories: { category: string; total: number }[];
}

export function SpendByCategory({ categories }: SpendByCategoryProps) {
  if (categories.length === 0) {
    return (
      <Card>
        <Text className="text-sm text-muted">
          No spending yet this month.
        </Text>
      </Card>
    );
  }

  const max = Math.max(...categories.map((c) => c.total), 1);
  const total = categories.reduce((sum, c) => sum + c.total, 0);

  return (
    <Card className="mb-4">
      <Text className="mb-4 text-base font-semibold text-white">
        Spending by category
      </Text>

      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-xs text-muted">This month</Text>
        <Text className="text-xs font-semibold text-white">
          {formatCurrency(total)}
        </Text>
      </View>

      {categories.map((category) => {
        const pct = Math.round((category.total / max) * 100);
        return (
          <View key={category.category} className="mb-3">
            <View className="mb-1.5 flex-row items-center">
              <Ionicons
                name={getCategoryIcon(category.category)}
                size={14}
                color={getCategoryColor(category.category)}
                style={{ marginRight: 6 }}
              />
              <Text className="flex-1 text-sm text-white">
                {category.category}
              </Text>
              <Text className="text-sm font-medium text-muted">
                {formatCurrency(category.total)}
              </Text>
            </View>
            <View className="h-1.5 overflow-hidden rounded-full bg-border">
              <View
                className="h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  backgroundColor: getCategoryColor(category.category),
                }}
              />
            </View>
          </View>
        );
      })}
    </Card>
  );
}