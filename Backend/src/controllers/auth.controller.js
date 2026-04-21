import { OTP } from "../models/otp.model.js";
import { User } from "../models/user.model.js";
import { Wallet } from "../models/walet.model.js";
import ApiError from "../utils/apiErros.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

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
  const { phoneNumber, otp } = req.body;

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

  if (otpRecord.otp !== otp) {
    throw new ApiError(400, "Invalid OTP");
  }

  await OTP.deleteMany({ phoneNumber });

  let existingUser = await User.findOne({ phoneNumber });

  if (!existingUser) {
    existingUser = await User.create({
      fullName: "New User",
      email: `${phoneNumber}@temp.com`,
      phoneNumber,
      upiId: `user${Date.now()}@paytm`,
      qrCode: `QR_${Date.now()}`,
      balance: 0
    });

    await Wallet.create({
      userId: existingUser._id,
      waletBalance: 0
    });
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: existingUser
      },
      "Login successful"
    )
  );
});