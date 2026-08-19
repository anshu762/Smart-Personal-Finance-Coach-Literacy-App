import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { Banner, Button, Chip, EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { EntryRow } from "@/components/ledger/EntryRow";
import { EntryForm } from "@/components/ledger/EntryForm";
import { groupEntries, type LedgerRow } from "@/components/ledger/groupEntries";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import {
  useDeleteEntry,
  useLedgerEntries,
  type EntryFilters,
  type LedgerEntry,
} from "@/hooks/useLedger";
import { formatSignedCurrency, startOfLocalMonth } from "@/lib/format";

type TypeFilter = "all" | "INCOME" | "EXPENSE";
type PeriodFilter = "all" | "month";

function emptyLedgerRows(height: number): LedgerRow[] {
  return Array.from({ length: height }).map((_, index) => ({
    kind: "header",
    key: `skeleton-${index}`,
    label: "",
    net: 0,
  }));
}

export default function LedgerScreen() {
  const { isOnline } = useNetworkStatus();

  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<LedgerEntry | null>(null);

  const filters = useMemo<EntryFilters>(() => {
    const next: EntryFilters = {};
    if (typeFilter !== "all") next.type = typeFilter;
    if (periodFilter === "month") next.from = startOfLocalMonth().toISOString();
    return next;
  }, [typeFilter, periodFilter]);

  const ledger = useLedgerEntries(filters);
  const deleteEntry = useDeleteEntry();

  const rows = useMemo(() => {
    const items = ledger.data?.pages.flatMap((page) => page.items) ?? [];
    return groupEntries(items);
  }, [ledger.data]);

  const openAdd = () => {
    setEditing(null);
    setFormVisible(true);
  };

  const openEdit = (entry: LedgerEntry) => {
    setEditing(entry);
    setFormVisible(true);
  };

  const closeForm = () => {
    setFormVisible(false);
    setEditing(null);
  };

  const confirmDelete = (entry: LedgerEntry) => {
    Alert.alert(
      "Delete entry?",
      `This will permanently remove the ${entry.category} entry of ${formatSignedCurrency(entry.amount, entry.type)}.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteEntry.mutate(entry.id),
        },
      ],
    );
  };

  const refresh = () => {
    void ledger.refetch();
  };

  const loadMore = () => {
    if (ledger.hasNextPage && !ledger.isFetchingNextPage) {
      void ledger.fetchNextPage();
    }
  };

  const renderItem = ({ item }: { item: LedgerRow }) => {
    if (item.kind === "header") {
      return (
        <View className="mb-2 mt-4 flex-row items-center justify-between px-1">
          <Text className="text-sm font-semibold text-muted">{item.label}</Text>
          {item.net !== 0 ? (
            <Text
              className="text-xs font-medium"
              style={{ color: item.net >= 0 ? "#22C55E" : "#EF4444" }}
            >
              Net {formatSignedCurrency(Math.abs(item.net), item.net >= 0 ? "INCOME" : "EXPENSE")}
            </Text>
          ) : null}
        </View>
      );
    }
    return (
      <EntryRow
        id={item.entry.id}
        type={item.entry.type}
        category={item.entry.category}
        amount={item.entry.amount}
        note={item.entry.note}
        date={item.entry.date}
        onPress={() => openEdit(item.entry)}
        onDelete={() => confirmDelete(item.entry)}
      />
    );
  };

  const ListEmptyComponent = () => {
    if (ledger.isLoading) {
      return (
        <View className="px-1 pt-4">
          <Skeleton height={16} className="mb-3" />
          <Skeleton height={68} className="mb-3" />
          <Skeleton height={68} className="mb-3" />
        </View>
      );
    }

    if (ledger.isError) {
      return <ErrorState onRetry={refresh} />;
    }

    const hasAnyEntries =
      (filters.type || filters.from) &&
      (ledger.data?.pages[0]?.items.length ?? 0) === 0 &&
      (ledger.data?.pages[0]?.hasMore ?? false) === false;

    return (
      <EmptyState
        title={hasAnyEntries ? "No matching entries" : "No transactions yet"}
        message={
          hasAnyEntries
            ? "Try changing the filters to see more."
            : "Add your first income or expense to start tracking your money."
        }
        icon={<Ionicons name="wallet-outline" size={48} color="#94A3B8" />}
        action={
          !hasAnyEntries ? (
            <Button title="Add your first entry" onPress={openAdd} />
          ) : undefined
        }
      />
    );
  };

  const ListFooterComponent = () =>
    ledger.isFetchingNextPage ? (
      <View className="items-center py-6">
        <ActivityIndicator color="#208AEF" />
      </View>
    ) : null;

  return (
    <View className="flex-1 bg-background">
      {!isOnline ? (
        <View className="px-4 pt-3">
          <Banner message="You're offline. Showing saved data — entries can't be added until you reconnect." variant="warning" />
        </View>
      ) : null}

      <View className="flex-row gap-2 px-4 pt-3">
        <Chip
          label="All"
          selected={typeFilter === "all"}
          onPress={() => setTypeFilter("all")}
        />
        <Chip
          label="Expenses"
          selected={typeFilter === "EXPENSE"}
          onPress={() => setTypeFilter("EXPENSE")}
        />
        <Chip
          label="Income"
          selected={typeFilter === "INCOME"}
          onPress={() => setTypeFilter("INCOME")}
        />
        <View className="w-4" />
        <Chip
          label="This month"
          selected={periodFilter === "month"}
          onPress={() => setPeriodFilter(periodFilter === "month" ? "all" : "month")}
        />
      </View>

      <FlatList
        className="flex-1 px-3"
        data={ledger.isLoading ? emptyLedgerRows(4) : rows}
        keyExtractor={(row) => row.key}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={ledger.isRefetching && !ledger.isFetchingNextPage}
            onRefresh={refresh}
            tintColor="#208AEF"
            colors={["#208AEF"]}
          />
        }
        ListEmptyComponent={ledger.isLoading ? null : ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
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
        accessibilityLabel="Add entry"
        onPress={openAdd}
      />

      <EntryForm
        visible={formVisible}
        initialValues={editing}
        isOffline={!isOnline}
        onClose={closeForm}
      />
    </View>
  );
}