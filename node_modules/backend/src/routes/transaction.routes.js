import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { sendMoney } from "../controllers/transaction.controller.js";
import { getTransactionHistory } from "../controllers/transaction.controller.js";

const router = express.Router();

router.post("/send", verifyJWT, sendMoney);

router.get("/history", verifyJWT, getTransactionHistory);
export default router;