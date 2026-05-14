import express from "express";
import { lookupUserByPhone, uploadProfilePhoto } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { uploadProfileImage } from "../middlewares/kycUpload.middleware.js";

const router = express.Router();

// GET /api/v1/users/lookup?phone=...
router.get("/lookup", lookupUserByPhone);
router.post("/profile-photo", verifyJWT, uploadProfileImage.single("profileImage"), uploadProfilePhoto);

export default router;
