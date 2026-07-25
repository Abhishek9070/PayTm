import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import { uploadKycDocument } from "../middlewares/kycUpload.middleware.js";
import {
  reviewKycSubmission,
  submitKycDocuments
} from "../controllers/kyc.controller.js";

const router = Router();

router.post(
  "/submit",
  verifyJWT,
  uploadKycDocument.single("documentImage"),
  submitKycDocuments
);

router.patch("/:userId/review", verifyJWT, isAdmin, reviewKycSubmission);

export default router;