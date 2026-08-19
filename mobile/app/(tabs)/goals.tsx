import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { Banner, Button, EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { GoalCard } from "@/components/goal/GoalCard";
import { GoalForm } from "@/components/goal/GoalForm";
import { useGoals, type Goal } from "@/hooks/useGoals";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { formatCurrency } from "@/lib/format";

type GoalSkeleton = { kind: "skeleton"; key: string };
type GoalRow = Goal | GoalSkeleton;

export default function GoalsScreen() {
  const { isOnline } = useNetworkStatus();
  const [formVisible, setFormVisible] = useState(false);

  const goals = useGoals();

  const total = (goals.data ?? []).reduce(
    (acc, goal) => acc + goal.savedAmount,
    0,
  );

  const refresh = () => void goals.refetch();

  const openCreate = () => setFormVisible(true);

  const isLoading = goals.isLoading;
  const skeletonData: GoalSkeleton[] = isLoading
    ? Array.from({ length: 3 }).map((_, i) => ({ kind: "skeleton" as const, key: `s-${i}` }))
    : [];

  return (
    <View className="flex-1 bg-background">
      {!isOnline ? (
        <View className="px-4 pt-3">
          <Banner message="You're offline. Showing saved goals — changes can't be saved." variant="warning" />
        </View>
      ) : null}

      {(goals.data?.length ?? 0) > 0 ? (
        <View className="flex-row items-center justify-between px-4 pt-4">
          <Text className="text-sm text-muted">Total saved</Text>
          <Text className="text-base font-semibold text-white">
            {formatCurrency(total)}
          </Text>
        </View>
      ) : null}

      <FlatList
        className="flex-1 px-3"
        data={isLoading ? skeletonData : (goals.data ?? []) as GoalRow[]}
        keyExtractor={(item) => ("kind" in item ? item.key : item.id)}
        renderItem={({ item }) =>
          "kind" in item ? (
            <Skeleton height={96} className="mb-3" />
          ) : (
            <GoalCard
              goal={item}
              onPress={() => router.push(`/goal/${item.id}`)}
            />
          )
        }
        contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={goals.isRefetching}
            onRefresh={refresh}
            tintColor="#208AEF"
            colors={["#208AEF"]}
          />
        }
        ListEmptyComponent={
          goals.isLoading ? null : goals.isError ? (
            <ErrorState onRetry={refresh} />
          ) : (
            <EmptyState
              title="No savings goals yet"
              message="Set a target and track your progress toward it."
              icon={<Ionicons name="flag-outline" size={48} color="#94A3B8" />}
              action={<Button title="Create your first goal" onPress={openCreate} />}
            />
          )
        }
      />

      <Button
        title=""
        leftIcon={<Ionicons name="add" size={24} color="#FFFFFF" />}
        style={{
          position: "absolute",
          right: 20,
          bottom: 28,
          width: 56,
          height: 56,
          borderRadius: 28,
          zIndex: 10,
        }}
        accessibilityLabel="Create goal"
        onPress={openCreate}
      />

      <GoalForm
        visible={formVisible}
        initialValues={null}
        isOffline={!isOnline}
        onClose={() => setFormVisible(false)}
      />
    </View>
  );
}