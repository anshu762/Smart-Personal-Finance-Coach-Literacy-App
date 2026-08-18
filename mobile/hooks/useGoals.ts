import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

/**
 * Savings goal queries and mutations.
 * Implemented in a later phase once /goals endpoints exist.
 */

export function useGoals() {
  return useQuery({
    queryKey: ["goals"],
    queryFn: () => Promise.resolve([] as unknown[]),
    enabled: false,
  });
}

export function useGoal(id: string) {
  return useQuery({
    queryKey: ["goals", id],
    queryFn: () => api.get(`/goals/${id}`).then((res) => res.data),
    enabled: false,
  });
}

export function useCreateGoal() {
  return useMutation({
    mutationFn: (input: unknown) =>
      api.post("/goals", input).then((res) => res.data),
  });
}