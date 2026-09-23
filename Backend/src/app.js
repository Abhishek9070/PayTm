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
import userRoutes from "./routes/user.routes.js";
import adminAuthRoutes from "./routes/admin.auth.routes.js";

const app = express();

const normalizeOrigin = (value) => {
    try {
        return new URL(value).origin;
    } catch {
        return null;
    }
};

const explicitOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:5174,https://payement-system.onrender.com,https://pay-tm-delta.vercel.app")
    .split(",")
    .map((o) => o.trim())
    .map(normalizeOrigin)
    .filter(Boolean);

const alwaysAllowOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174"
].map(normalizeOrigin).filter(Boolean);

const allowedOrigins = [...new Set([...explicitOrigins, ...alwaysAllowOrigins])];

console.log("CORS allowed origins:", allowedOrigins);

const corsOptions = {
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Global CORS middleware handles preflight for valid routes.

app.use(
    "/api/v1/razorpay/webhook",
    express.raw({ type: "application/json" }),
    handleRazorpayWebhook
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/transactions", transactionRoutes);
app.use("/api/v1/wallet", walletRoutes);
app.use("/api/v1/withdrawals", withdrawalRoutes);
app.use("/api/v1/razorpay", razorpayRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/kyc", kycRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/admin/auth", adminAuthRoutes);
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