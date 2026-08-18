import { Text, View } from "react-native";
import { Card, Skeleton } from "@/components/ui";

export default function DashboardScreen() {
  const isLoading = false;

  if (isLoading) {
    return (
      <View className="flex-1 bg-background p-4">
        <Skeleton height={120} className="mb-4" />
        <Skeleton height={80} className="mb-4" />
        <Skeleton height={80} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background p-4">
      <Text className="mb-4 text-2xl font-bold text-white">Overview</Text>

      <Card className="mb-4">
        <Text className="text-sm text-muted">This month</Text>
        <Text className="mt-1 text-3xl font-bold text-white">$0.00</Text>
      </Card>

      <Card>
        <Text className="text-base font-semibold text-white">
          No entries yet
        </Text>
        <Text className="mt-1 text-sm text-muted">
          Your income and expenses will appear here.
        </Text>
      </Card>
    </View>
  );
}