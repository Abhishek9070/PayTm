import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import { uploadKycDocuments } from "../middlewares/kycUpload.middleware.js";
import {
  reviewKycSubmission,
  submitKycDocuments
} from "../controllers/kyc.controller.js";

const router = Router();

router.post(
  "/submit",
  verifyJWT,
  uploadKycDocuments.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "aadhaarImage", maxCount: 1 },
    { name: "panImage", maxCount: 1 }
  ]),
  submitKycDocuments
);

router.patch("/:userId/review", verifyJWT, isAdmin, reviewKycSubmission);

export default router;