import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { EmptyState } from "@/components/ui";

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="flex-1 bg-background">
      <EmptyState
        title="Article"
        message={`Article ${id} will appear here.`}
      />
    </View>
  );
}