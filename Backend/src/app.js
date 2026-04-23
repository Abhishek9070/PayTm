import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import walletRoutes from "./routes/wallet.routes.js";
import ApiResponse from "./utils/apiResponse.js";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true
    })
);

app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/transactions", transactionRoutes);
app.use("/api/v1/wallet", walletRoutes);

app.get("/", (req, res) => {
    res.status(200).json(new ApiResponse(200, null, "API is running..."));
});

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