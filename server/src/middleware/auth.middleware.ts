import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";

export interface AuthUser {
  userId: string;
  email: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      data: null,
      error: {
        message: "Authentication required",
        code: "UNAUTHORIZED",
      },
    });
    return;
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = verifyToken(token);
    req.user = { userId: payload.userId, email: payload.email };
    next();
  } catch {
    res.status(401).json({
      success: false,
      data: null,
      error: {
        message: "Invalid or expired token",
        code: "UNAUTHORIZED",
      },
    });
  }
}