import { User } from "../models/user.model.js";
import { Wallet } from "../models/walet.model.js";
import ApiError from "../utils/apiErros.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
 
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPhoneNumber = (phoneNumber) => {
  return /^\d{10}$/.test(phoneNumber);
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax"
};

const buildSafeUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  phoneNumber: user.phoneNumber,
  upiId: user.upiId,
  qrCode: user.qrCode,
  kyc: user.kyc,
  isVerified: user.isVerified,
  isAdmin: user.isAdmin
});

const issueAuthTokens = async (user) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, phoneNumber, email, password } = req.body;

  if (!fullName || !phoneNumber || !password) {
    throw new ApiError(400, "fullName, phoneNumber, and password are required");
  }

  if (!isValidPhoneNumber(phoneNumber)) {
    throw new ApiError(400, "Invalid phone number");
  }

  if (email && !isValidEmail(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  const existingUser = await User.findOne({ phoneNumber });

  if (existingUser) {
    throw new ApiError(409, "Phone number is already registered");
  }

  if (email) {
    const existingEmail = await User.findOne({ email: email.toLowerCase() });

    if (existingEmail) {
      throw new ApiError(409, "Email is already registered");
    }
  }

  const user = await User.create({
    fullName,
    phoneNumber,
    email: email || undefined,
    password,
    upiId: `user${phoneNumber}@ptm`,
    qrCode: `QR_${Date.now()}`,
    isVerified: true
  });

  await Wallet.create({
    userId: user._id,
    balance: 0
  });

  const { accessToken, refreshToken } = await issueAuthTokens(user);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          user: buildSafeUser(user),
          accessToken,
          refreshToken
        },
        "Signup successful"
      )
    );
});

export const loginUser = asyncHandler(async (req, res) => {
  const { phoneNumber, password } = req.body;

  if (!phoneNumber || !password) {
    throw new ApiError(400, "Phone number and password are required");
  }

  if (!isValidPhoneNumber(phoneNumber)) {
    throw new ApiError(400, "Invalid phone number");
  }

  const user = await User.findOne({ phoneNumber }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid phone number or password");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid phone number or password");
  }

  const { accessToken, refreshToken } = await issueAuthTokens(user);

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
        user: buildSafeUser(user),
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