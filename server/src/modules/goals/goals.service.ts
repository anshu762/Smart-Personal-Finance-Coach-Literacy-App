import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/error.middleware";
import type {
  AddFundsInput,
  CreateGoalInput,
  UpdateGoalInput,
} from "./goals.schema";

const goalSelect = {
  id: true,
  title: true,
  targetAmount: true,
  savedAmount: true,
  deadline: true,
  createdAt: true,
} satisfies Prisma.GoalSelect;

type RawGoal = Prisma.GoalGetPayload<{ select: typeof goalSelect }>;

export interface PublicGoal {
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

function toPublicGoal(goal: RawGoal): PublicGoal {
  const isComplete = goal.savedAmount >= goal.targetAmount;
  const isOverdue =
    goal.deadline !== null && goal.deadline.getTime() < Date.now() && !isComplete;

  const rawProgress = (goal.savedAmount / goal.targetAmount) * 100;
  const progress = isComplete ? 100 : Math.min(100, Math.round(rawProgress * 10) / 10);
  const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);

  return {
    id: goal.id,
    title: goal.title,
    targetAmount: goal.targetAmount,
    savedAmount: goal.savedAmount,
    deadline: goal.deadline ? goal.deadline.toISOString() : null,
    createdAt: goal.createdAt.toISOString(),
    progress,
    remaining,
    isComplete,
    isOverdue,
  };
}

export async function createGoal(userId: string, input: CreateGoalInput) {
  const goal = await prisma.goal.create({
    data: {
      userId,
      title: input.title,
      targetAmount: input.targetAmount,
      deadline: input.deadline ? new Date(input.deadline) : null,
    },
    select: goalSelect,
  });
  return toPublicGoal(goal);
}

export async function listGoals(userId: string): Promise<PublicGoal[]> {
  const goals = await prisma.goal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: goalSelect,
  });
  return goals.map(toPublicGoal);
}

async function findOwnedGoal(userId: string, id: string): Promise<RawGoal> {
  const goal = await prisma.goal.findFirst({
    where: { id, userId },
    select: goalSelect,
  });
  if (!goal) {
    throw new AppError(404, "Goal not found", "GOAL_NOT_FOUND");
  }
  return goal;
}

export async function getGoal(userId: string, id: string) {
  const goal = await findOwnedGoal(userId, id);
  return toPublicGoal(goal);
}

export async function updateGoal(
  userId: string,
  id: string,
  input: UpdateGoalInput,
) {
  await findOwnedGoal(userId, id);

  const goal = await prisma.goal.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.targetAmount !== undefined
        ? { targetAmount: input.targetAmount }
        : {}),
      ...(input.deadline !== undefined
        ? { deadline: input.deadline === null ? null : new Date(input.deadline) }
        : {}),
    },
    select: goalSelect,
  });
  return toPublicGoal(goal);
}

export async function deleteGoal(userId: string, id: string) {
  await findOwnedGoal(userId, id);
  await prisma.goal.delete({ where: { id } });
  return { id };
}

export async function addFunds(
  userId: string,
  id: string,
  input: AddFundsInput,
) {
  const goal = await findOwnedGoal(userId, id);

  const newSaved = goal.savedAmount + input.amount;

  if (newSaved > goal.targetAmount && !input.confirm) {
    const overBy = newSaved - goal.targetAmount;
    const roomLeft = Math.max(0, goal.targetAmount - goal.savedAmount);
    throw new AppError(
      409,
      `This add would exceed your target by $${overBy.toFixed(2)}. ` +
        `Add at most $${roomLeft.toFixed(2)} to reach your target, ` +
        "or confirm to save more than your target.",
      "GOAL_OVER_TARGET",
    );
  }

  const updated = await prisma.goal.update({
    where: { id },
    data: { savedAmount: { increment: input.amount } },
    select: goalSelect,
  });
  return toPublicGoal(updated);
}