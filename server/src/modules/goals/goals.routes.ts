import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  createGoalSchema,
  updateGoalSchema,
  addFundsSchema,
} from "./goals.schema";
import {
  createGoalHandler,
  listGoalsHandler,
  getGoalHandler,
  updateGoalHandler,
  deleteGoalHandler,
  addFundsHandler,
} from "./goals.controller";

const router = Router();

router.use(authenticate);

router.post("/", validate(createGoalSchema), createGoalHandler);
router.get("/", listGoalsHandler);
router.get("/:id", getGoalHandler);
router.patch("/:id", validate(updateGoalSchema), updateGoalHandler);
router.post("/:id/funds", validate(addFundsSchema), addFundsHandler);
router.delete("/:id", deleteGoalHandler);

export default router;