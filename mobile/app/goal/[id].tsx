import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { EmptyState } from "@/components/ui";

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="flex-1 bg-background">
      <EmptyState
        title="Goal details"
        message={`Details for goal ${id} will appear here.`}
      />
    </View>
  );
}