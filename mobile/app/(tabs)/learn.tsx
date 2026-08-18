import { Text, View } from "react-native";
import { EmptyState } from "@/components/ui";

export default function LearnScreen() {
  return (
    <View className="flex-1 bg-background">
      <EmptyState
        title="Learning content coming soon"
        message="Articles and quizzes will help you level up your money skills."
      />
    </View>
  );
}