import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { Banner, Button, Card, EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { AddFundsModal } from "@/components/goal/AddFundsModal";
import { GoalDeadlineBadge } from "@/components/goal/GoalDeadlineBadge";
import { GoalForm } from "@/components/goal/GoalForm";
import { GoalProgressBar } from "@/components/goal/GoalProgressBar";
import { useDeleteGoal, useGoal, type Goal } from "@/hooks/useGoals";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { getErrorCode } from "@/lib/api";
import { formatCurrency, formatDateShort } from "@/lib/format";

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isOnline } = useNetworkStatus();

  const goalQuery = useGoal(id);
  const deleteGoal = useDeleteGoal();

  const [addFundsVisible, setAddFundsVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);

  const confirmDelete = () => {
    const hasProgress = (goalQuery.data?.savedAmount ?? 0) > 0;
    Alert.alert(
      "Delete this goal?",
      hasProgress
        ? "You've saved toward this goal. Deleting it removes the goal and all saved progress that can't be recovered."
        : "This goal will be permanently removed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (!id) return;
            deleteGoal.mutate(id, {
              onSuccess: () => router.back(),
            });
          },
        },
      ],
    );
  };

  if (goalQuery.isLoading) {
    return (
      <View className="flex-1 bg-background p-4">
        <Skeleton height={180} className="mb-4" />
        <Skeleton height={96} className="mb-4" />
      </View>
    );
  }

  if (
    goalQuery.isError &&
    id !== undefined &&
    getErrorCode(goalQuery.error) === "GOAL_NOT_FOUND"
  ) {
    return (
      <View className="flex-1 bg-background p-4">
        <EmptyState
          title="Goal not found"
          message="This goal may have been deleted."
          icon={<Ionicons name="flag-outline" size={48} color="#94A3B8" />}
          action={
            <Button title="Back to goals" variant="outline" onPress={() => router.back()} />
          }
        />
      </View>
    );
  }

  if (goalQuery.isError) {
    return (
      <View className="flex-1 bg-background p-4">
        <ErrorState onRetry={() => void goalQuery.refetch()} />
      </View>
    );
  }

  const goal = goalQuery.data;
  if (!goal) return null;

  return (
    <View className="flex-1 bg-background">
      {!isOnline ? (
        <View className="px-4 pt-3">
          <Banner message="You're offline. Changes can't be saved." variant="warning" />
        </View>
      ) : null}

      <GoalDetails
        goal={goal}
        pendingDelete={deleteGoal.isPending}
        onAddFunds={() => setAddFundsVisible(true)}
        onEdit={() => setEditVisible(true)}
        onDelete={confirmDelete}
      />

      <AddFundsModal
        visible={addFundsVisible}
        goal={goal}
        isOffline={!isOnline}
        onClose={() => setAddFundsVisible(false)}
      />

      <GoalForm
        visible={editVisible}
        initialValues={goal}
        isOffline={!isOnline}
        onClose={() => setEditVisible(false)}
      />
    </View>
  );
}

function GoalDetails({
  goal,
  pendingDelete,
  onAddFunds,
  onEdit,
  onDelete,
}: {
  goal: Goal;
  pendingDelete: boolean;
  onAddFunds: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const barColor = goal.isComplete
    ? "#22C55E"
    : goal.isOverdue
      ? "#D97706"
      : "#208AEF";

  const pct = Math.round(goal.progress);

  return (
    <ScrollView
      className="flex-1 px-4"
      contentContainerStyle={{ paddingBottom: 48 }}
    >
      {goal.isComplete ? (
        <Card className="mb-4 items-center py-8">
          <View className="mb-3 h-16 w-16 items-center justify-center rounded-full bg-success/15">
            <Ionicons name="trophy" size={34} color="#22C55E" />
          </View>
          <Text className="text-xl font-bold text-white">You did it!</Text>
          <Text className="mt-1 text-center text-sm text-muted">
            {goal.title} is complete — you’ve saved{" "}
            {formatCurrency(goal.savedAmount)}.
          </Text>
          <View className="mt-4 w-full">
            <GoalProgressBar progress={goal.progress} color="#22C55E" />
          </View>
          <View className="mt-2 w-full flex-row justify-between">
            <Text className="text-xs text-muted">
              {formatCurrency(goal.targetAmount)} target
            </Text>
            <Text className="text-xs font-semibold text-success">100%</Text>
          </View>
          {goal.savedAmount > goal.targetAmount ? (
            <Text className="mt-3 text-sm text-success">
              You’re {formatCurrency(goal.savedAmount - goal.targetAmount)} over your target!
            </Text>
          ) : null}
        </Card>
      ) : (
        <Card className="mb-4">
          <View className="mb-4 flex-row items-start justify-between gap-2">
            <Text className="flex-1 text-xl font-bold text-white" numberOfLines={3}>
              {goal.title}
            </Text>
            <GoalDeadlineBadge
              deadline={goal.deadline}
              isComplete={goal.isComplete}
              isOverdue={goal.isOverdue}
            />
          </View>

          {goal.isOverdue && goal.deadline ? (
            <View className="mb-4">
              <Banner
                message={`This goal passed its deadline on ${formatDateShort(goal.deadline)} and isn't complete yet.`}
                variant="warning"
              />
            </View>
          ) : null}

          <GoalProgressBar progress={goal.progress} color={barColor} />

          <View className="mt-2 flex-row items-center justify-between">
            <Text className="text-sm text-muted">Progress</Text>
            <Text className="text-sm font-semibold text-white">{pct}%</Text>
          </View>
        </Card>
      )}

      <View className="mb-4 flex-row gap-3">
        <View className="flex-1">
          <View className="rounded-xl border border-border bg-surface p-4">
            <Text className="text-xs text-muted">Saved</Text>
            <Text className="mt-1 text-lg font-semibold text-white">
              {formatCurrency(goal.savedAmount)}
            </Text>
          </View>
        </View>
        <View className="flex-1">
          <View className="rounded-xl border border-border bg-surface p-4">
            <Text className="text-xs text-muted">Target</Text>
            <Text className="mt-1 text-lg font-semibold text-white">
              {formatCurrency(goal.targetAmount)}
            </Text>
          </View>
        </View>
      </View>

      <View className="mb-6 rounded-xl border border-border bg-surface p-4">
        <Text className="text-xs text-muted">Remaining</Text>
        <Text className="mt-1 text-lg font-semibold text-primary">
          {formatCurrency(goal.remaining)}
        </Text>
        <Text className="mt-1 text-xs text-muted">
          Created {formatDateShort(goal.createdAt)}
        </Text>
      </View>

      <Button
        title="Add funds"
        fullWidth
        leftIcon={<Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />}
        onPress={onAddFunds}
        className="mb-3"
      />
      <Button
        title="Edit goal"
        variant="secondary"
        fullWidth
        onPress={onEdit}
        className="mb-3"
      />
      <Button
        title="Delete goal"
        variant="danger"
        fullWidth
        loading={pendingDelete}
        onPress={onDelete}
      />
    </ScrollView>
  );
}