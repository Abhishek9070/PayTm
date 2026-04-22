import { OTP } from "../models/otp.model.js";
import { User } from "../models/user.model.js";
import { Wallet } from "../models/walet.model.js";
import ApiError from "../utils/apiErros.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax"
};

export const sendOtp = asyncHandler(async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
    throw new ApiError(400, "Invalid phone number");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

  await OTP.deleteMany({ phoneNumber });
  await OTP.create({
    phoneNumber,
    otp,
    expiresAt
  });

  console.log(`OTP for ${phoneNumber}: ${otp}`);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "OTP sent successfully"));
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { phoneNumber, otp, fullName, email } = req.body;

  if (!phoneNumber || !otp) {
    throw new ApiError(400, "Phone number and OTP required");
  }

  const otpRecord = await OTP.findOne({ phoneNumber });

  if (!otpRecord) {
    throw new ApiError(400, "OTP not found");
  }

  if (otpRecord.expiresAt < new Date()) {
    throw new ApiError(400, "OTP expired");
  }

  const isOtpValid = await otpRecord.isOtpCorrect(otp);

  if (!isOtpValid) {
    throw new ApiError(400, "Invalid OTP");
  }

  await OTP.deleteMany({ phoneNumber });

  let existingUser = await User.findOne({ phoneNumber });

  if (!existingUser) {
    if (!fullName || !email) {
      throw new ApiError(400, "fullName and email are required for new users");
    }

    if (!isValidEmail(email)) {
      throw new ApiError(400, "Invalid email format");
    }

    existingUser = await User.create({
      fullName,
      email,
      phoneNumber,
      upiId: `user${phoneNumber}@ptm`,
      qrCode: `QR_${Date.now()}`,
      isVerified: true
    });

    await Wallet.create({
      userId: existingUser._id,
      balance: 0
    });
  } else if (!existingUser.isVerified) {
    existingUser.isVerified = true;
    await existingUser.save();
  }

  const accessToken = existingUser.generateAccessToken();
  const refreshToken = existingUser.generateRefreshToken();

  existingUser.refreshToken = refreshToken;
  await existingUser.save({ validateBeforeSave: false });

  const safeUser = {
    _id: existingUser._id,
    fullName: existingUser.fullName,
    email: existingUser.email,
    phoneNumber: existingUser.phoneNumber,
    upiId: existingUser.upiId,
    qrCode: existingUser.qrCode,
    isVerified: existingUser.isVerified
  };

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 2 * 24 * 60 * 60 * 1000
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 12 * 24 * 60 * 60 * 1000
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: safeUser,
        accessToken,
        refreshToken
      },
      "Login successful"
    )
  );
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "Unauthorized request");
  }

  const newAccessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie("accessToken", newAccessToken, {
    ...cookieOptions,
    maxAge: 2 * 24 * 60 * 60 * 1000
  });

  res.cookie("refreshToken", newRefreshToken, {
    ...cookieOptions,
    maxAge: 12 * 24 * 60 * 60 * 1000
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      },
      "Access token refreshed successfully"
    )
  );
});