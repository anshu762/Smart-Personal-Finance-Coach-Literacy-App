import { NextFunction, Request, Response } from "express";
import { success } from "../../utils/apiResponse";
import { AppError } from "../../middleware/error.middleware";
import * as goalsService from "./goals.service";
import type {
  AddFundsInput,
  CreateGoalInput,
  UpdateGoalInput,
} from "./goals.schema";

function requireUserId(req: Request): string {
  if (!req.user?.userId) {
    throw new AppError(401, "Authentication required", "UNAUTHORIZED");
  }
  return req.user.userId;
}

export async function createGoalHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const goal = await goalsService.createGoal(
      requireUserId(req),
      req.body as CreateGoalInput,
    );
    res.status(201).json(success({ goal }));
  } catch (error) {
    next(error);
  }
}

export async function listGoalsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const goals = await goalsService.listGoals(requireUserId(req));
    res.json(success({ goals }));
  } catch (error) {
    next(error);
  }
}

export async function getGoalHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const goal = await goalsService.getGoal(
      requireUserId(req),
      req.params.id,
    );
    res.json(success({ goal }));
  } catch (error) {
    next(error);
  }
}

export async function updateGoalHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const goal = await goalsService.updateGoal(
      requireUserId(req),
      req.params.id,
      req.body as UpdateGoalInput,
    );
    res.json(success({ goal }));
  } catch (error) {
    next(error);
  }
}

export async function deleteGoalHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await goalsService.deleteGoal(
      requireUserId(req),
      req.params.id,
    );
    res.json(success(result));
  } catch (error) {
    next(error);
  }
}

export async function addFundsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const goal = await goalsService.addFunds(
      requireUserId(req),
      req.params.id,
      req.body as AddFundsInput,
    );
    res.json(success({ goal }));
  } catch (error) {
    next(error);
  }
}