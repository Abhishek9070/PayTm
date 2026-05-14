import ApiError from "../utils/apiErros.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const toCloudinaryAsset = (file) => ({
  url: file.path,
  publicId: file.filename,
  mimeType: file.mimetype,
  uploadedAt: new Date()
});

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

export const uploadProfilePhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "profileImage is required");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.profileImage = toCloudinaryAsset(req.file);
  await user.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          _id: user._id,
          profileImage: user.profileImage
        }
      },
      "Profile photo uploaded successfully"
    )
  );
});
