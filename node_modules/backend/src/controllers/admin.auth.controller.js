import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import ApiError from "../utils/apiErros.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax"
};

const buildSafeAdmin = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  phoneNumber: user.phoneNumber,
  role: user.role || "support_admin",
  permissions: user.permissions || [],
  lastLogin: null,
  isActive: true,
  isAdmin: true
});

const issueAdminAuthTokens = async (admin) => {
  const accessToken = admin.generateAccessToken();
  const refreshToken = admin.generateRefreshToken();

  admin.refreshToken = refreshToken;
  await admin.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

export const adminLogin = asyncHandler(async (req, res) => {
  const { phoneNumber, password } = req.body;

  if (!phoneNumber || !password) {
    throw new ApiError(400, "Phone number and password are required");
  }

  const normalizedPhoneNumber = String(phoneNumber).trim();

  if (!/^\d{10}$/.test(normalizedPhoneNumber)) {
    throw new ApiError(400, "Invalid phone number");
  }

  const admin = await User.findOne({ phoneNumber: normalizedPhoneNumber }).select(
    "+password"
  );

  if (!admin) {
    throw new ApiError(401, "Invalid phone number or password");
  }

  if (!admin.isAdmin) {
    throw new ApiError(403, "Access denied: Admin only");
  }

  const isPasswordValid = await admin.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid phone number or password");
  }

  const { accessToken, refreshToken } = await issueAdminAuthTokens(admin);

  return res
    .status(200)
    // set both admin-specific and generic cookie names so protected routes
    // and refresh logic can read whichever name is available
    .cookie("adminAccessToken", accessToken, cookieOptions)
    .cookie("adminRefreshToken", refreshToken, cookieOptions)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          admin: buildSafeAdmin(admin),
          accessToken,
          refreshToken
        },
        "Admin login successful"
      )
    );
});

export const adminLogout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: null }
    },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("adminAccessToken")
    .clearCookie("adminRefreshToken")
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, null, "Admin logout successful"));
});

export const getAdminProfile = asyncHandler(async (req, res) => {
  const admin = req.user;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { admin: buildSafeAdmin(admin) },
        "Admin profile retrieved successfully"
      )
    );
});

export const refreshAdminToken = asyncHandler(async (req, res) => {
  // accept either admin-specific cookie name or generic cookie/body value
  const token = req.cookies?.adminRefreshToken || req.cookies?.refreshToken || req.body?.refreshToken;

  if (!token) {
    throw new ApiError(401, "Refresh token is missing");
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const admin = await User.findById(decoded.id);

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  if (!admin.isAdmin) {
    throw new ApiError(403, "Access denied: Admin only");
  }

  if (admin.refreshToken !== token) {
    throw new ApiError(401, "Refresh token does not match");
  }

  const { accessToken, refreshToken } = await issueAdminAuthTokens(admin);

  return res
    .status(200)
    .cookie("adminAccessToken", accessToken, cookieOptions)
    .cookie("adminRefreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          admin: buildSafeAdmin(admin),
          accessToken,
          refreshToken
        },
        "Token refreshed successfully"
      )
    );
});
