import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createRazorpayOrder,
  verifyRazorpayPayment
} from "../controllers/razorpay.controller.js";
const router = Router();

router.post(
  "/create-order",
  verifyJWT,
  createRazorpayOrder
);
router.post(
  "/verify-payment",
  verifyJWT,
  verifyRazorpayPayment
);
export default router;