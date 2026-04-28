import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import {
  approveWithdrawal,
  createWithdrawal,
  getMyWithdrawals,
  getPendingWithdrawals,
  rejectWithdrawal
} from "../controllers/withdrawal.controller.js";

const router = express.Router();

router.post("/", verifyJWT, createWithdrawal);
router.get("/my", verifyJWT, getMyWithdrawals);

router.get("/pending", verifyJWT, isAdmin, getPendingWithdrawals);
router.patch("/:withdrawalId/approve", verifyJWT, isAdmin, approveWithdrawal);
router.patch("/:withdrawalId/reject", verifyJWT, isAdmin, rejectWithdrawal);

export default router;
