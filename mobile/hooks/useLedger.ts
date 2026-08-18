import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

/**
 * Ledger (income/expense) queries and mutations.
 * Implemented in a later phase once /ledger endpoints exist.
 */

export function useLedgerEntries() {
  return useQuery({
    queryKey: ["ledger", "entries"],
    queryFn: () => Promise.resolve([] as unknown[]),
    enabled: false,
  });
}

export function useCreateEntry() {
  return useMutation({
    mutationFn: (input: unknown) =>
      api.post("/ledger", input).then((res) => res.data),
  });
}

export function useDeleteEntry() {
  return useMutation({
    mutationFn: (id: string) => api.delete(`/ledger/${id}`).then((res) => res.data),
  });
}