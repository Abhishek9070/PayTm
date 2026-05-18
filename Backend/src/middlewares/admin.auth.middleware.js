import jwt from "jsonwebtoken";
import { Admin } from "../models/admin.model.js";
import ApiError from "../utils/apiErros.js";
import asyncHandler from "../utils/asyncHandler.js";

export const verifyAdmin = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers?.authorization || "";
  const bearerToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;

  const token = req.cookies?.adminAccessToken || bearerToken;

  if (!token) {
    throw new ApiError(401, "Admin access token is missing");
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.ADMIN_ACCESS_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired admin access token");
  }

  const admin = await Admin.findById(decoded.id);

  if (!admin) {
    throw new ApiError(401, "Admin not found");
  }

  if (!admin.isActive) {
    throw new ApiError(403, "Admin account is inactive");
  }

  req.admin = admin;
  next();
});

export const requireAdminRole = (requiredRoles = []) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.admin) {
      throw new ApiError(401, "Admin authentication required");
    }

    if (requiredRoles.length > 0 && !requiredRoles.includes(req.admin.role)) {
      throw new ApiError(403, "Insufficient permissions for this action");
    }

    next();
  });
};

export const requireAdminPermission = (requiredPermission) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.admin) {
      throw new ApiError(401, "Admin authentication required");
    }

    if (!req.admin.permissions.includes(requiredPermission)) {
      throw new ApiError(403, `Permission '${requiredPermission}' is required`);
    }

    next();
  });
};
