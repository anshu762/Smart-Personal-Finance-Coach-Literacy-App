import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import {
  signupSchema,
  loginSchema,
  refreshSchema,
} from "./auth.schema";
import {
  signupHandler,
  loginHandler,
  refreshHandler,
  meHandler,
} from "./auth.controller";

const router = Router();

router.post("/signup", validate(signupSchema), signupHandler);
router.post("/login", validate(loginSchema), loginHandler);
router.post("/refresh", validate(refreshSchema), refreshHandler);
router.get("/me", authenticate, meHandler);

export default router;