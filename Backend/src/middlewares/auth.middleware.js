import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import ApiError from "../utils/apiErros.js";
import asyncHandler from "../utils/asyncHandler.js";

export const verifyRefreshToken = asyncHandler(async (req, res, next) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  const refreshTokenSecret =
    process.env.REFRESH_TOKEN_SECRET 

  if (!refreshTokenSecret) {
    throw new ApiError(500, "Refresh token secret is not configured");
  }

  let decodedToken;

  try {
    decodedToken = jwt.verify(incomingRefreshToken, refreshTokenSecret);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decodedToken?.id);

  if (!user) {
    throw new ApiError(401, "Invalid refresh token");
  }

  if (!user.refreshToken || user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Refresh token mismatch");
  }

  req.user = user;
  req.refreshToken = incomingRefreshToken;

  next();
});
