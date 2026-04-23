import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import { getWalletBalance } from "../controllers/wallet.controller.js";
import {
	approveDeposit,
	createDeposit,
	getMyDeposits,
	getPendingDeposits,
	rejectDeposit
} from "../controllers/deposit.controller.js";

const router = express.Router();

router.get("/balance", verifyJWT, getWalletBalance);
router.post("/add-balance", verifyJWT, createDeposit);
router.get("/add-balance/requests", verifyJWT, getMyDeposits);

router.get("/add-balance/pending", verifyJWT, isAdmin, getPendingDeposits);
router.patch("/add-balance/:depositId/approve", verifyJWT, isAdmin, approveDeposit);
router.patch("/add-balance/:depositId/reject", verifyJWT, isAdmin, rejectDeposit);

export default router;
