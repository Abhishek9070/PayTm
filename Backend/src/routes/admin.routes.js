import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import {
  getAdminDashboardSummary,
  getFraudEvents,
  getPendingActionsOverview
} from "../controllers/admin.controller.js";
import { getAdminTransactions, getSecurityEvents } from "../controllers/admin.controller.js";
import { sendAdminNotification } from "../controllers/adminNotifications.controller.js";
// AdminAudit import removed to avoid potential circular import at route load time
import {
  getPendingKyc,
  getKycById,
  approveKyc,
  rejectKyc
} from "../controllers/admin.controller.js";
import {
  getAdminUsers,
  getAdminUserById,
  freezeUser,
  unfreezeUser,
  blockUser
} from "../controllers/admin.controller.js";

const router = Router();

router.get("/dashboard/summary", verifyJWT, isAdmin, getAdminDashboardSummary);
router.get("/dashboard/stats", verifyJWT, isAdmin, getAdminDashboardSummary);
router.get("/dashboard/pending-actions", verifyJWT, isAdmin, getPendingActionsOverview);
router.get("/dashboard/fraud-events", verifyJWT, isAdmin, getFraudEvents);

// User management
router.get("/users", verifyJWT, isAdmin, getAdminUsers);
router.get("/users/:id", verifyJWT, isAdmin, getAdminUserById);
router.patch("/users/:id/freeze", verifyJWT, isAdmin, freezeUser);
router.patch("/users/:id/unfreeze", verifyJWT, isAdmin, unfreezeUser);
router.patch("/users/:id/block", verifyJWT, isAdmin, blockUser);

// KYC management
router.get("/kyc/pending", verifyJWT, isAdmin, getPendingKyc);
router.get("/kyc/:id", verifyJWT, isAdmin, getKycById);
router.patch("/kyc/:id/approve", verifyJWT, isAdmin, approveKyc);
router.patch("/kyc/:id/reject", verifyJWT, isAdmin, rejectKyc);

// Transactions & security events
router.get("/transactions", verifyJWT, isAdmin, getAdminTransactions);
router.get("/security-events", verifyJWT, isAdmin, getSecurityEvents);
router.post("/notifications/send", verifyJWT, isAdmin, sendAdminNotification);

export default router;