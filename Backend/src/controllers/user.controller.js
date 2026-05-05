import ApiError from "../utils/apiErros.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

export const lookupUserByPhone = asyncHandler(async (req, res) => {
  const { phone } = req.query;

  if (!phone) {
    throw new ApiError(400, "phone query parameter is required");
  }

  const normalized = String(phone).trim();

  const user = await User.findOne({ phoneNumber: normalized }).select("_id fullName phoneNumber email");

  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, "User not found"));
  }

  return res.status(200).json(new ApiResponse(200, user, "User found"));
});
