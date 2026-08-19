import { NextFunction, Request, Response } from "express";
import { success } from "../../utils/apiResponse";
import { AppError } from "../../middleware/error.middleware";
import * as ledgerService from "./ledger.service";
import type {
  CreateEntryInput,
  ListEntriesQuery,
  UpdateEntryInput,
} from "./ledger.schema";

function requireUserId(req: Request): string {
  if (!req.user?.userId) {
    throw new AppError(401, "Authentication required", "UNAUTHORIZED");
  }
  return req.user.userId;
}

export async function createEntryHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const entry = await ledgerService.createEntry(
      requireUserId(req),
      req.body as CreateEntryInput,
    );
    res.status(201).json(success({ entry }));
  } catch (error) {
    next(error);
  }
}

export async function listEntriesHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await ledgerService.listEntries(
      requireUserId(req),
      req.query as unknown as ListEntriesQuery,
    );
    res.json(success(result));
  } catch (error) {
    next(error);
  }
}

export async function updateEntryHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const entry = await ledgerService.updateEntry(
      requireUserId(req),
      req.params.id,
      req.body as UpdateEntryInput,
    );
    res.json(success({ entry }));
  } catch (error) {
    next(error);
  }
}

export async function deleteEntryHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await ledgerService.deleteEntry(
      requireUserId(req),
      req.params.id,
    );
    res.json(success(result));
  } catch (error) {
    next(error);
  }
}

export async function summaryHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = req.query as unknown as { tzOffset?: number };
    const summary = await ledgerService.getSummary(
      requireUserId(req),
      query.tzOffset ?? 0,
    );
    res.json(success({ summary }));
  } catch (error) {
    next(error);
  }
}