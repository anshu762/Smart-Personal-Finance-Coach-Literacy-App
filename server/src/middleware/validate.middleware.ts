import { NextFunction, Request, Response } from "express";
import { z } from "zod";

type RequestPart = "body" | "query" | "params";

export function validate(schema: z.ZodTypeAny, part: RequestPart = "body") {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      res.status(400).json({
        success: false,
        data: null,
        error: {
          message: "Validation failed",
          code: "VALIDATION_ERROR",
          issues: result.error.flatten().fieldErrors,
        },
      });
      return;
    }

    req[part] = result.data;
    next();
  };
}