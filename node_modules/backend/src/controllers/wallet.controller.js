import { Wallet } from "../models/walet.model.js";
import ApiError from "../utils/apiErros.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const addBalance = asyncHandler(async (req, res) => {
  throw new ApiError(
    405,
    "Direct balance top-up is disabled. Create a deposit request and wait for admin approval."
  );
});

export const getWalletBalance = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const wallet = await Wallet.findOne({ userId });

  if (!wallet) {
    throw new ApiError(404, "Wallet not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        availableBalance: wallet.balance,
        lockedBalance: wallet.lockedBalance ?? 0,
        totalBalance: wallet.balance + (wallet.lockedBalance ?? 0),
        balance: wallet.balance
      },
      "Wallet balance fetched successfully"
    )
  );
});