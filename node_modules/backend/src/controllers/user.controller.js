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

export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  const userId = req.user._id;

  if (!fullName && !email) {
    throw new ApiError(400, "Provide at least fullName or email to update");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if email is already in use by another user
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ApiError(409, "Email is already in use");
    }
    user.email = email.toLowerCase().trim();
  }

  if (fullName) {
    user.fullName = fullName.trim();
  }

  await user.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profileImage: user.profileImage,
        upiId: user.upiId
      },
      "Profile updated successfully"
    )
  );
});

export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user._id;

  // Validation
  if (!oldPassword || !newPassword || !confirmPassword) {
    throw new ApiError(400, "Old password, new password, and confirm password are required");
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "New password and confirm password do not match");
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, "New password must be at least 6 characters long");
  }

  if (oldPassword === newPassword) {
    throw new ApiError(400, "New password cannot be the same as old password");
  }

  // Fetch user with password field
  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Verify old password using bcrypt
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Old password is incorrect");
  }

  // Update password
  user.password = newPassword;
  await user.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {},
      "Password changed successfully"
    )
  );
});
