import { Text, View } from "react-native";
import { EmptyState } from "@/components/ui";

export default function GoalsScreen() {
  return (
    <View className="flex-1 bg-background">
      <EmptyState
        title="No savings goals yet"
        message="Set a goal and track your progress."
      />
    </View>
  );
}