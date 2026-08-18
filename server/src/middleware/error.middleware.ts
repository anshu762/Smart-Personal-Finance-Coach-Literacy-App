import { NextFunction, Request, Response } from "express";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    data: null,
    error: {
      message: `Route not found: ${req.method} ${req.originalUrl}`,
      code: "NOT_FOUND",
    },
  });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      data: null,
      error: { message: err.message, code: err.code },
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    success: false,
    data: null,
    error: {
      message: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    },
  });
}