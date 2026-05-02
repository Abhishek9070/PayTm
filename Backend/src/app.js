import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import walletRoutes from "./routes/wallet.routes.js";
import withdrawalRoutes from "./routes/withdrawal.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import ApiResponse from "./utils/apiResponse.js";
import { handleRazorpayWebhook } from "./controllers/razorpay.controller.js";
import razorpayRoutes from "./routes/razorpay.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import kycRoutes from "./routes/kyc.routes.js";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true
    })
);

app.use(
    "/api/v1/razorpay/webhook",
    express.raw({ type: "application/json" }),
    handleRazorpayWebhook
);

app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/transactions", transactionRoutes);
app.use("/api/v1/wallet", walletRoutes);
app.use("/api/v1/withdrawals", withdrawalRoutes);
app.use("/api/v1/razorpay", razorpayRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/kyc", kycRoutes);
app.get("/", (req, res) => {
    res.status(200).json(new ApiResponse(200, null, "API is running..."));
});
app.use("/api/v1/notifications", notificationRouter);
app.use((err, req, res, next) => {
    const statusCode = err?.statusCode || err?.status || 500;
    const message = err?.message || "Something went wrong";
    const errorData = err?.errors ? { errors: err.errors } : null;

    if (statusCode >= 500) {
        console.error(err?.stack || err);
    }

    res.status(statusCode).json(new ApiResponse(statusCode, errorData, message));
});

export { app };