import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { Banner, Button, Card, EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { SpendByCategory } from "@/components/ledger/SpendByCategory";
import { useLedgerSummary } from "@/hooks/useLedger";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { formatCurrency, formatSignedCurrency } from "@/lib/format";

interface MetricCardProps {
  title: string;
  income: number;
  expense: number;
  emphasizeNet?: boolean;
}

function MetricCard({ title, income, expense, emphasizeNet = false }: MetricCardProps) {
  const net = income - expense;

  return (
    <Card className="mb-4">
      <Text className="text-sm font-medium text-muted">{title}</Text>

      <View className="mt-2 flex-row items-center justify-between">
        <View>
          <Text className="text-xs text-muted">Income</Text>
          <Text className="mt-0.5 text-sm font-medium text-white">
            {formatCurrency(income)}
          </Text>
        </View>
        <View>
          <Text className="text-xs text-muted">Spent</Text>
          <Text className="mt-0.5 text-sm font-medium text-white">
            {formatCurrency(expense)}
          </Text>
        </View>
        <View>
          <Text className="text-xs text-muted">Net</Text>
          <Text
            className="mt-0.5 text-sm font-semibold"
            style={{
              color: net >= 0 ? "#22C55E" : "#EF4444",
              fontSize: emphasizeNet ? 20 : 16,
            }}
          >
            {formatSignedCurrency(Math.abs(net), net >= 0 ? "INCOME" : "EXPENSE")}
          </Text>
        </View>
      </View>
    </Card>
  );
}

export default function DashboardScreen() {
  const { isOnline } = useNetworkStatus();
  const summary = useLedgerSummary();

  if (summary.isLoading) {
    return (
      <View className="flex-1 bg-background p-4">
        <Skeleton height={132} className="mb-4" />
        <Skeleton height={100} className="mb-4" />
        <Skeleton height={100} className="mb-4" />
        <Skeleton height={200} />
      </View>
    );
  }

  if (summary.isError) {
    return (
      <View className="flex-1 bg-background p-4">
        <ErrorState
          onRetry={() => void summary.refetch()}
          style={{ flex: 1 }}
        />
      </View>
    );
  }

  const data = summary.data;
  if (!data) return null;

  const isEmpty =
    data.today.income === 0 &&
    data.today.expense === 0 &&
    data.thisWeek.income === 0 &&
    data.thisWeek.expense === 0 &&
    data.thisMonth.income === 0 &&
    data.thisMonth.expense === 0;

  return (
    <ScrollView
      className="flex-1 bg-background px-4"
      refreshControl={
        <RefreshControl
          refreshing={summary.isRefetching}
          onRefresh={() => void summary.refetch()}
          tintColor="#208AEF"
          colors={["#208AEF"]}
        />
      }
    >
      {!isOnline ? (
        <View className="pt-3">
          <Banner message="You're offline. Charts may be out of date." variant="warning" />
        </View>
      ) : null}

      {isEmpty ? (
        <EmptyState
          title="Welcome to your dashboard"
          message="Add entries to see your income, spending and trends here."
          icon={<Ionicons name="stats-chart-outline" size={48} color="#94A3B8" />}
          action={
            <Button title="Go to ledger" onPress={() => router.push("/ledger")} />
          }
        />
      ) : (
        <>
          <MetricCard
            title="This month"
            income={data.thisMonth.income}
            expense={data.thisMonth.expense}
            emphasizeNet
          />
          <MetricCard
            title="This week"
            income={data.thisWeek.income}
            expense={data.thisWeek.expense}
          />
          <MetricCard
            title="Today"
            income={data.today.income}
            expense={data.today.expense}
          />

          <SpendByCategory categories={data.categories} />
        </>
      )}
    </ScrollView>
  );
}