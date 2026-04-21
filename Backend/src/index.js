import { app } from "./app.js";
import authRoutes from "./routes/auth.routes.js";
import dotenv from "dotenv";
import dbConnection from "./db/index.js";
import ApiResponse from "./utils/apiResponse.js";

dotenv.config({
  path: "./.env"
});

app.use("/api/v1/auth", authRoutes);

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

const PORT = process.env.PORT || 3000;

dbConnection()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
  });