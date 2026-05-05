import express from "express";
import { lookupUserByPhone } from "../controllers/user.controller.js";

const router = express.Router();

// GET /api/v1/users/lookup?phone=...
router.get("/lookup", lookupUserByPhone);

export default router;
