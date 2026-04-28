import mongoose from "mongoose";
import { Wallet } from "../models/walet.model.js";
import { Withdrawal } from "../models/withdraw.model.js";
import { Transaction } from "../models/transaction.model.js"; // ✅ NEW
import ApiError from "../utils/apiErros.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


// USER → Create Withdrawal
export const createWithdrawal = asyncHandler(async (req, res) => {
  const { amount, upiId } = req.body;
  const userId = req.user._id;

  const parsedAmount = Number(amount);

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    throw new ApiError(400, "Invalid amount");
  }

  if (!upiId || !upiId.trim()) {
    throw new ApiError(400, "UPI ID required");
  }

  const wallet = await Wallet.findOneAndUpdate(
    {
      userId,
      $expr: {
        $gte: [
          { $subtract: ["$balance", "$lockedBalance"] },
          parsedAmount
        ]
      }
    },
    { $inc: { lockedBalance: parsedAmount } },
    { new: true }
  );

  if (!wallet) {
    const existingWallet = await Wallet.findOne({ userId });

    if (!existingWallet) {
      throw new ApiError(404, "Wallet not found");
    }

    throw new ApiError(400, "Insufficient available balance");
  }

  const withdrawal = await Withdrawal.create({
    userId,
    amount: parsedAmount,
    upiId: upiId.trim().toLowerCase()
  });

  return res.status(201).json(
    new ApiResponse(201, withdrawal, "Withdrawal request created")
  );
});


//  USER → Get My Withdrawals
export const getMyWithdrawals = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const withdrawals = await Withdrawal.find({ userId })
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, withdrawals, "Withdrawal history fetched")
  );
});


// ADMIN → Get Pending Withdrawals
export const getPendingWithdrawals = asyncHandler(async (req, res) => {
  const withdrawals = await Withdrawal.find({ status: "pending" })
    .populate("userId", "fullName phoneNumber")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, withdrawals, "Pending withdrawals fetched")
  );
});


//  ADMIN → Approve Withdrawal (UPDATED)
export const approveWithdrawal = asyncHandler(async (req, res) => {
  const { withdrawalId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(withdrawalId)) {
    throw new ApiError(400, "Invalid withdrawal id");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const withdrawal = await Withdrawal.findById(withdrawalId).session(session);

    if (!withdrawal) {
      throw new ApiError(404, "Withdrawal not found");
    }

    if (withdrawal.status !== "pending") {
      throw new ApiError(400, "Already processed");
    }

    const wallet = await Wallet.findOneAndUpdate(
      {
        userId: withdrawal.userId,
        lockedBalance: { $gte: withdrawal.amount },
        balance: { $gte: withdrawal.amount }
      },
      {
        $inc: {
          lockedBalance: -withdrawal.amount,
          balance: -withdrawal.amount
        }
      },
      { new: true, session }
    );

    if (!wallet) {
      throw new ApiError(409, "Wallet state mismatch for approval");
    }

    // ✅ ADD THIS (CRITICAL)
    await Transaction.create(
      [
        {
          type: "withdrawal",
          userId: withdrawal.userId,
          amount: withdrawal.amount,
          status: "success",
          direction: "debit"
        }
      ],
      { session }
    );

    withdrawal.status = "approved";
    withdrawal.reviewedBy = req.user._id;
    withdrawal.reviewedAt = new Date();
    withdrawal.rejectionReason = undefined;

    await withdrawal.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json(
      new ApiResponse(200, withdrawal, "Withdrawal approved")
    );

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});


// ADMIN → Reject Withdrawal
export const rejectWithdrawal = asyncHandler(async (req, res) => {
  const { withdrawalId } = req.params;
  const { reason } = req.body;

  if (!mongoose.Types.ObjectId.isValid(withdrawalId)) {
    throw new ApiError(400, "Invalid withdrawal id");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const withdrawal = await Withdrawal.findById(withdrawalId).session(session);

    if (!withdrawal) {
      throw new ApiError(404, "Withdrawal not found");
    }

    if (withdrawal.status !== "pending") {
      throw new ApiError(400, "Already processed");
    }

    const wallet = await Wallet.findOneAndUpdate(
      {
        userId: withdrawal.userId,
        lockedBalance: { $gte: withdrawal.amount }
      },
      { $inc: { lockedBalance: -withdrawal.amount } },
      { new: true, session }
    );

    if (!wallet) {
      throw new ApiError(409, "Wallet state mismatch for rejection");
    }

    withdrawal.status = "rejected";
    withdrawal.reviewedBy = req.user._id;
    withdrawal.reviewedAt = new Date();
    withdrawal.rejectionReason = reason?.trim() || "Rejected by admin";

    await withdrawal.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json(
      new ApiResponse(200, withdrawal, "Withdrawal rejected")
    );

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});