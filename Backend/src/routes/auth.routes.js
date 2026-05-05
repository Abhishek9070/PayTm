import express from "express";
import { registerUser } from "../controllers/auth.controller.js";
import { loginUser } from "../controllers/auth.controller.js";
import { refreshAccessToken } from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRefreshToken } from "../middlewares/refreshToken.middleware.js";
const router = express.Router();

router.get("/profile", verifyJWT, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", verifyRefreshToken, refreshAccessToken);

export default router;