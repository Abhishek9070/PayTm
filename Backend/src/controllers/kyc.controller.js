import { User } from "../models/user.model.js";
import ApiError from "../utils/apiErros.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const allowedDocumentTypes = new Set(["aadhaar", "pan"]);

const toCloudinaryAsset = (file) => ({
  url: file.path,
  publicId: file.filename,
  mimeType: file.mimetype,
  uploadedAt: new Date()
});

export const submitKycDocuments = asyncHandler(async (req, res) => {
  const {
    documentType,
    fullName,
    phoneNumber,
    address,
    gender,
    aadhaarNumber,
    panNumber
  } = req.body;

  const normalizedDocumentType = String(documentType || "").trim().toLowerCase();
  const normalizedFullName = String(fullName || "").trim();
  const normalizedPhoneNumber = String(phoneNumber || "").trim();
  const normalizedAddress = String(address || "").trim();
  const normalizedGender = String(gender || "").trim();
  const normalizedAadhaarNumber = String(aadhaarNumber || "").trim();
  const normalizedPanNumber = String(panNumber || "").trim();

  if (!allowedDocumentTypes.has(normalizedDocumentType)) {
    throw new ApiError(400, "documentType must be aadhaar or pan");
  }

  if (!normalizedFullName || !normalizedPhoneNumber || !normalizedAddress || !normalizedGender) {
    throw new ApiError(400, "fullName, phoneNumber, address, and gender are required");
  }

  if (normalizedDocumentType === "aadhaar" && !normalizedAadhaarNumber) {
    throw new ApiError(400, "aadhaarNumber is required for Aadhaar KYC");
  }

  if (normalizedDocumentType === "pan" && !normalizedPanNumber) {
    throw new ApiError(400, "panNumber is required for PAN KYC");
  }

  if (!req.file) {
    throw new ApiError(400, "documentImage is required");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.kyc = {
    status: "pending",
    documentType: normalizedDocumentType,
    fullName: normalizedFullName,
    phoneNumber: normalizedPhoneNumber,
    address: normalizedAddress,
    gender: normalizedGender,
    aadhaarNumber: normalizedDocumentType === "aadhaar" ? normalizedAadhaarNumber : null,
    panNumber: normalizedDocumentType === "pan" ? normalizedPanNumber : null,
    documentImage: toCloudinaryAsset(req.file),
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