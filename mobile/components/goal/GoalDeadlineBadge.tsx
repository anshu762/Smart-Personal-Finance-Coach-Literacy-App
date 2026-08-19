import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { formatDateShort } from "@/lib/format";

export interface GoalDeadlineBadgeProps {
  deadline: string | null;
  isComplete: boolean;
  isOverdue?: boolean;
}

export function GoalDeadlineBadge({
  deadline,
  isComplete,
  isOverdue = false,
}: GoalDeadlineBadgeProps) {
  if (isComplete) {
    return (
      <View className="flex-row items-center rounded-full bg-success px-2.5 py-1">
        <Ionicons name="checkmark-circle" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
        <Text className="text-xs font-semibold text-white">Completed</Text>
      </View>
    );
  }

  if (isOverdue) {
    return (
      <View className="flex-row items-center rounded-full bg-danger px-2.5 py-1">
        <Ionicons name="alert-circle" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
        <Text className="text-xs font-semibold text-white">Overdue</Text>
      </View>
    );
  }

  if (!deadline) {
    return (
      <View className="flex-row items-center rounded-full border border-border bg-surface px-2.5 py-1">
        <Ionicons name="calendar-outline" size={13} color="#94A3B8" style={{ marginRight: 4 }} />
        <Text className="text-xs font-medium text-muted">No deadline</Text>
      </View>
    );
  }

  return (
    <View className="flex-row items-center rounded-full border border-border bg-surface px-2.5 py-1">
      <Ionicons name="calendar-outline" size={13} color="#94A3B8" style={{ marginRight: 4 }} />
      <Text className="text-xs font-medium text-muted">
        Due {formatDateShort(deadline)}
      </Text>
    </View>
  );
}