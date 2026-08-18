import { NextFunction, Request, Response } from "express";
import { success } from "../../utils/apiResponse";
import { AppError } from "../../middleware/error.middleware";
import * as authService from "./auth.service";
import type { LoginInput, RefreshInput, SignupInput } from "./auth.schema";

export async function signupHandler(
  req: Request<object, object, SignupInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await authService.signup(req.body);
    res.status(201).json(success(result));
  } catch (error) {
    next(error);
  }
}

export async function loginHandler(
  req: Request<object, object, LoginInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await authService.login(req.body);
    res.json(success(result));
  } catch (error) {
    next(error);
  }
}

export async function refreshHandler(
  req: Request<object, object, RefreshInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = authService.refresh(req.body.refreshToken);
    res.json(success(result));
  } catch (error) {
    next(error);
  }
}

export async function meHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, "Authentication required", "UNAUTHORIZED");
    }
    const user = await authService.getUserById(req.user.userId);
    res.json(success({ user }));
  } catch (error) {
    next(error);
  }
}