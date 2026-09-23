import { Router } from "express";
import {
  adminLogin,
  adminLogout,
  getAdminProfile,
  refreshAdminToken,
  updateAdminProfile
} from "../controllers/admin.auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.post("/login", adminLogin);
router.post("/refresh-token", refreshAdminToken);
router.post("/logout", verifyJWT, isAdmin, adminLogout);
router.get("/me", verifyJWT, isAdmin, getAdminProfile);
router.patch("/profile", verifyJWT, isAdmin, updateAdminProfile);

export default router;
