import express from "express";
import { sendOtp } from "../controllers/auth.controller.js";
import { verifyOtp } from "../controllers/auth.controller.js";
const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
export default router;