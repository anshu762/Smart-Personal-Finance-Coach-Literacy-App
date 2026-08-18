import { Text, View } from "react-native";
import { EmptyState } from "@/components/ui";

export default function LedgerScreen() {
  return (
    <View className="flex-1 bg-background">
      <EmptyState
        title="No transactions yet"
        message="Add your first income or expense to start tracking."
      />
    </View>
  );
}