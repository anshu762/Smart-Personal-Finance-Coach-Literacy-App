import express, { Express, Router } from "express";
import cors from "cors";
import { env } from "./config/env";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware";
import { prisma } from "./lib/prisma";
import authRoutes from "./modules/auth/auth.routes";

export function createApp(): Express {
  const app: Express = express();

  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  const healthRouter = Router();
  healthRouter.get("/health", async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({
        success: true,
        data: {
          status: "ok",
          database: "connected",
          timestamp: new Date().toISOString(),
        },
        error: null,
      });
    } catch (error) {
      console.error("Health check DB failure:", error);
      res.status(503).json({
        success: false,
        data: null,
        error: {
          message: "Database connection failed",
          code: "DB_UNAVAILABLE",
        },
      });
    }
  });
  app.use("/api/v1", healthRouter);
  app.use("/api/v1/auth", authRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}