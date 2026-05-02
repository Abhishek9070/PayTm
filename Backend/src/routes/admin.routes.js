import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import {
  getAdminDashboardSummary,
  getFraudEvents,
  getPendingActionsOverview
} from "../controllers/admin.controller.js";

const router = Router();

router.get("/dashboard/summary", verifyJWT, isAdmin, getAdminDashboardSummary);
router.get("/dashboard/pending-actions", verifyJWT, isAdmin, getPendingActionsOverview);
router.get("/dashboard/fraud-events", verifyJWT, isAdmin, getFraudEvents);

export default router;