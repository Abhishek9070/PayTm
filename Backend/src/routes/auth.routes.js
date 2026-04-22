import express from "express";
import { sendOtp } from "../controllers/auth.controller.js";
import { verifyOtp } from "../controllers/auth.controller.js";
import { refreshAccessToken } from "../controllers/auth.controller.js";
import { verifyRefreshToken } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/refresh-token", verifyRefreshToken, refreshAccessToken);
export default router;