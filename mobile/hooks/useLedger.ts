import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  InfiniteData,
} from "@tanstack/react-query";
import {
  api,
  extractData,
  type ApiBody,
} from "@/lib/api";
import { toast } from "@/store/toastStore";
import type { EntryType } from "@/lib/format";

export interface LedgerEntry {
  id: string;
  type: EntryType;
  category: string;
  amount: number;
  note: string | null;
  date: string;
  createdAt: string;
}

export interface LedgerListResult {
  items: LedgerEntry[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface EntryFilters {
  type?: EntryType;
  category?: string;
  from?: string;
  to?: string;
}

export interface CreateEntryInput {
  type: EntryType;
  category: string;
  amount: number;
  note?: string;
  date: string;
}

export interface UpdateEntryInput {
  type?: EntryType;
  category?: string;
  amount?: number;
  note?: string;
  date?: string;
}

export interface LedgerSummary {
  today: { income: number; expense: number };
  thisWeek: { income: number; expense: number };
  thisMonth: { income: number; expense: number };
  categories: { category: string; total: number }[];
}

const ENTRIES_KEY = ["ledger", "entries"] as const;
const SUMMARY_KEY = ["ledger", "summary"] as const;

export const PAGE_SIZE = 20;

function invalidateLedger(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ENTRIES_KEY });
  void queryClient.invalidateQueries({ queryKey: SUMMARY_KEY });
}

export function useLedgerEntries(filters: EntryFilters = {}) {
  return useInfiniteQuery<LedgerListResult>({
    queryKey: ["ledger", "entries", filters],
    queryFn: ({ pageParam }) =>
      api
        .get<ApiBody<LedgerListResult>>("/ledger", {
          params: {
            ...filters,
            limit: PAGE_SIZE,
            cursor: pageParam ?? undefined,
          },
        })
        .then(extractData),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useCreateEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateEntryInput) =>
      api
        .post<ApiBody<{ entry: LedgerEntry }>>("/ledger", input)
        .then(extractData)
        .then((data) => data.entry),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ENTRIES_KEY });
      const snapshot = queryClient.getQueriesData<InfiniteData<LedgerListResult>>(
        { queryKey: ENTRIES_KEY },
      );

      const optimistic: LedgerEntry = {
        id: `temp-${Date.now()}`,
        type: input.type,
        category: input.category,
        amount: input.amount,
        note: input.note?.trim() ? input.note : null,
        date: input.date,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueriesData<InfiniteData<LedgerListResult>>(
        { queryKey: ENTRIES_KEY },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page, index) =>
              index === 0 ? { ...page, items: [optimistic, ...page.items] } : page,
            ),
          };
        },
      );

      return { snapshot };
    },
    onError: (error, _variables, context) => {
      if (context?.snapshot) {
        for (const [key, data] of context.snapshot) {
          queryClient.setQueryData(key, data);
        }
      }
      toast("Couldn't add entry. Please try again.", "error");
    },
    onSettled: () => invalidateLedger(queryClient),
  });
}

export function useUpdateEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateEntryInput }) =>
      api
        .patch<ApiBody<{ entry: LedgerEntry }>>(`/ledger/${id}`, input)
        .then(extractData)
        .then((data) => data.entry),
    onError: () => {
      toast("Couldn't update entry. Please try again.", "error");
    },
    onSettled: () => invalidateLedger(queryClient),
  });
}

export function useDeleteEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api
        .delete<ApiBody<{ id: string }>>(`/ledger/${id}`)
        .then(extractData),
    onError: () => {
      toast("Couldn't delete entry. Please try again.", "error");
    },
    onSettled: () => invalidateLedger(queryClient),
  });
}

export function useLedgerSummary() {
  const tzOffset = -new Date().getTimezoneOffset();

  return useQuery({
    queryKey: ["ledger", "summary"],
    queryFn: () =>
      api
        .get<ApiBody<{ summary: LedgerSummary }>>("/ledger/summary", {
          params: { tzOffset },
        })
        .then(extractData)
        .then((data) => data.summary),
  });
}