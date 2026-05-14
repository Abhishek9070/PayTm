import express from "express";
import { registerUser } from "../controllers/auth.controller.js";
import { loginUser } from "../controllers/auth.controller.js";
import { refreshAccessToken } from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRefreshToken } from "../middlewares/refreshToken.middleware.js";
const router = express.Router();

router.get("/profile", verifyJWT, (req, res) => {
  const {
    _id,
    fullName,
    email,
    phoneNumber,
    upiId,
    qrCode,
    profileImage,
    kyc,
    isVerified,
    isAdmin
  } = req.user;

  res.json({
    success: true,
    user: {
      _id,
      fullName,
      email,
      phoneNumber,
      upiId,
      qrCode,
      profileImage: profileImage || kyc?.profileImage || null,
      kyc,
      isVerified,
      isAdmin
    }
  });
});
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", verifyRefreshToken, refreshAccessToken);

export default router;