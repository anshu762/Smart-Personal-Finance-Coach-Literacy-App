import { Pressable, Text, View } from "react-native";
import { Card } from "@/components/ui";
import { GoalDeadlineBadge } from "./GoalDeadlineBadge";
import { GoalProgressBar } from "./GoalProgressBar";
import type { Goal } from "@/hooks/useGoals";
import { formatCurrency } from "@/lib/format";

export interface GoalCardProps {
  goal: Goal;
  onPress: () => void;
}

export function GoalCard({ goal, onPress }: GoalCardProps) {
  const barColor = goal.isComplete
    ? "#22C55E"
    : goal.isOverdue
      ? "#D97706"
      : "#208AEF";

  return (
    <Card padded={false} className="mb-3">
      <Pressable
        onPress={onPress}
        className="px-4 py-4 active:bg-slate-800"
        accessibilityRole="button"
      >
        <View className="mb-3 flex-row items-start justify-between gap-2">
          <Text className="flex-1 text-base font-semibold text-white" numberOfLines={2}>
            {goal.title}
          </Text>
          <GoalDeadlineBadge
            deadline={goal.deadline}
            isComplete={goal.isComplete}
            isOverdue={goal.isOverdue}
          />
        </View>

        <GoalProgressBar progress={goal.progress} color={barColor} />

        <View className="mt-2 flex-row items-center justify-between">
          <Text className="text-sm text-muted">
            {formatCurrency(goal.savedAmount)}{" "}
            <Text className="text-muted">/ {formatCurrency(goal.targetAmount)}</Text>
          </Text>
          {goal.isComplete ? (
            <Text className="text-sm font-semibold text-success">Reached!</Text>
          ) : (
            <Text className="text-sm font-semibold text-white">
              {Math.round(goal.progress)}%
            </Text>
          )}
        </View>
      </Pressable>
    </Card>
  );
}