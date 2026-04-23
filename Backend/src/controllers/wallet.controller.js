import { Wallet } from "../models/walet.model.js";
import ApiError from "../utils/apiErros.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const addBalance = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const userId = req.user._id;

  if (!amount || amount <= 0) {
    throw new ApiError(400, "Invalid amount");
  }

  const wallet = await Wallet.findOne({ userId });

  if (!wallet) {
    throw new ApiError(404, "Wallet not found");
  }

  wallet.balance += Number(amount);
  await wallet.save();

  return res.status(200).json(
    new ApiResponse(200, wallet, "Balance added successfully")
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
      { balance: wallet.balance },
      "Wallet balance fetched successfully"
    )
  );
});