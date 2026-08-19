import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  api,
  extractData,
  type ApiBody,
} from "@/lib/api";
import { toast } from "@/store/toastStore";

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string | null;
  createdAt: string;
  progress: number;
  remaining: number;
  isComplete: boolean;
  isOverdue: boolean;
}

export interface CreateGoalInput {
  title: string;
  targetAmount: number;
  deadline?: string;
}

export interface UpdateGoalInput {
  title?: string;
  targetAmount?: number;
  deadline?: string | null;
}

export interface AddFundsInput {
  amount: number;
  confirm?: boolean;
}

const GOALS_KEY = ["goals"] as const;

function invalidateGoals(queryClient: ReturnType<typeof useQueryClient>, id?: string) {
  void queryClient.invalidateQueries({ queryKey: GOALS_KEY });
  if (id) {
    void queryClient.invalidateQueries({ queryKey: ["goals", id] });
  }
}

export function useGoals() {
  return useQuery<Goal[]>({
    queryKey: GOALS_KEY,
    queryFn: () =>
      api
        .get<ApiBody<{ goals: Goal[] }>>("/goals")
        .then(extractData)
        .then((data) => data.goals),
  });
}

export function useGoal(id?: string) {
  return useQuery<Goal>({
    queryKey: ["goals", id],
    enabled: Boolean(id),
    queryFn: () =>
      api
        .get<ApiBody<{ goal: Goal }>>(`/goals/${id}`)
        .then(extractData)
        .then((data) => data.goal),
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateGoalInput) =>
      api
        .post<ApiBody<{ goal: Goal }>>("/goals", input)
        .then(extractData)
        .then((data) => data.goal),
    onSuccess: (goal) => {
      toast(`"${goal.title}" created`, "success");
    },
    onError: () => {
      toast("Couldn't create goal. Please try again.", "error");
    },
    onSettled: () => invalidateGoals(queryClient),
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateGoalInput }) =>
      api
        .patch<ApiBody<{ goal: Goal }>>(`/goals/${id}`, input)
        .then(extractData)
        .then((data) => data.goal),
    onSuccess: (goal) => {
      toast(`"${goal.title}" updated`, "success");
    },
    onError: () => {
      toast("Couldn't update goal. Please try again.", "error");
    },
    onSettled: (_data, _error, variables) =>
      invalidateGoals(queryClient, variables.id),
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api
        .delete<ApiBody<{ id: string }>>(`/goals/${id}`)
        .then(extractData),
    onSuccess: () => {
      toast("Goal deleted", "success");
    },
    onError: () => {
      toast("Couldn't delete goal. Please try again.", "error");
    },
    onSettled: () => invalidateGoals(queryClient),
  });
}

export function useAddFunds() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AddFundsInput }) =>
      api
        .post<ApiBody<{ goal: Goal }>>(`/goals/${id}/funds`, input)
        .then(extractData)
        .then((data) => data.goal),
    onSuccess: (goal) => {
      toast(`Added funds to "${goal.title}"`, "success");
    },
    onSettled: (_data, _error, variables) =>
      invalidateGoals(queryClient, variables.id),
  });
}