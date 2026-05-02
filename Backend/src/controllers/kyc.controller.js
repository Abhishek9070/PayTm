import { User } from "../models/user.model.js";
import ApiError from "../utils/apiErros.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const requiredKycFields = ["profileImage", "aadhaarImage", "panImage"];

const toCloudinaryAsset = (file) => ({
  url: file.path,
  publicId: file.filename,
  mimeType: file.mimetype,
  uploadedAt: new Date()
});

const getUploadedFile = (files, fieldName) => files?.[fieldName]?.[0] || null;

export const submitKycDocuments = asyncHandler(async (req, res) => {
  const missingFields = requiredKycFields.filter(
    (fieldName) => !getUploadedFile(req.files, fieldName)
  );

  if (missingFields.length > 0) {
    throw new ApiError(
      400,
      `Missing KYC files: ${missingFields.join(", ")}`
    );
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.kyc = {
    status: "pending",
    profileImage: toCloudinaryAsset(getUploadedFile(req.files, "profileImage")),
    aadhaarImage: toCloudinaryAsset(getUploadedFile(req.files, "aadhaarImage")),
    panImage: toCloudinaryAsset(getUploadedFile(req.files, "panImage")),
    submittedAt: new Date(),
    reviewedAt: null,
    reviewedBy: null,
    rejectionReason: null
  };
  user.isVerified = false;

  await user.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          _id: user._id,
          kyc: user.kyc,
          isVerified: user.isVerified
        }
      },
      "KYC documents uploaded successfully"
    )
  );
});

export const reviewKycSubmission = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { status, rejectionReason } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    throw new ApiError(400, "Status must be approved or rejected");
  }

  if (status === "rejected" && !rejectionReason) {
    throw new ApiError(400, "rejectionReason is required when rejecting KYC");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.kyc = {
    ...user.kyc,
    status,
    reviewedAt: new Date(),
    reviewedBy: req.user._id,
    rejectionReason: status === "rejected" ? rejectionReason : null
  };
  user.isVerified = status === "approved";

  await user.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          _id: user._id,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          kyc: user.kyc,
          isVerified: user.isVerified
        }
      },
      `KYC ${status} successfully`
    )
  );
});