import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  createEntrySchema,
  updateEntrySchema,
  listEntriesQuerySchema,
  summaryQuerySchema,
} from "./ledger.schema";
import {
  createEntryHandler,
  listEntriesHandler,
  updateEntryHandler,
  deleteEntryHandler,
  summaryHandler,
} from "./ledger.controller";

const router = Router();

router.use(authenticate);

router.post("/", validate(createEntrySchema), createEntryHandler);
router.get(
  "/",
  validate(listEntriesQuerySchema, "query"),
  listEntriesHandler,
);
router.get(
  "/summary",
  validate(summaryQuerySchema, "query"),
  summaryHandler,
);
router.patch("/:id", validate(updateEntrySchema), updateEntryHandler);
router.delete("/:id", deleteEntryHandler);

export default router;