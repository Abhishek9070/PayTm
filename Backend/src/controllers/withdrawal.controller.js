import mongoose from "mongoose";
import { Wallet } from "../models/walet.model.js";
import { Withdrawal } from "../models/withdraw.model.js";
import { Transaction } from "../models/transaction.model.js"; 
import { createNotification } from "../utils/createNotification.js";
import {
  consumeActionRateLimit,
  recordSecurityEvent,
  WITHDRAWAL_COOLDOWN_MS
} from "../utils/fraudProtection.js";
import ApiError from "../utils/apiErros.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const notifyWithdrawalRequested = async ({ userId, amount, upiId }) => {
  try {
    await createNotification({
      userId,
      title: "Withdrawal Request Created",
      message: `Your withdrawal request of ₹${amount} has been created for ${upiId}.`,
      type: "withdrawal",
      metadata: {
        amount,
        upiId,
        status: "pending"
      }
    });
  } catch (error) {
    console.log("Withdrawal request notification failed:", error.message);
  }
};

const notifyWithdrawalApproved = async ({ userId, amount }) => {
  try {
    await createNotification({
      userId,
      title: "Withdrawal Approved",
      message: `Your withdrawal of ₹${amount} has been approved successfully.`,
      type: "withdrawal",
      metadata: {
        amount,
        status: "approved"
      }
    });
  } catch (error) {
    console.log("Withdrawal approval notification failed:", error.message);
  }
};

const notifyWithdrawalRejected = async ({ userId, amount, reason }) => {
  try {
    await createNotification({
      userId,
      title: "Withdrawal Rejected",
      message: `Your withdrawal of ₹${amount} was rejected${reason ? `: ${reason}` : ""}.`,
      type: "withdrawal",
      metadata: {
        amount,
        reason: reason || null,
        status: "rejected"
      }
    });
  } catch (error) {
    console.log("Withdrawal rejection notification failed:", error.message);
  }
};

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

  await consumeActionRateLimit({
    userId: userId.toString(),
    action: "withdrawal_request",
    limit: 2,
    windowMs: 15 * 60 * 1000,
    reason: "Too many withdrawal attempts. Please wait before trying again.",
    route: req.originalUrl,
    ipAddress: req.ip,
    metadata: {
      amount: parsedAmount,
      upiId: upiId.trim().toLowerCase()
    }
  });

  const pendingWithdrawal = await Withdrawal.findOne({
    userId,
    status: "pending"
  }).sort({ createdAt: -1 });

  if (pendingWithdrawal) {
    await recordSecurityEvent({
      userId,
      actionType: "duplicate_payment",
      reason: "User already has a pending withdrawal request",
      severity: "medium",
      blocked: true,
      route: req.originalUrl,
      ipAddress: req.ip,
      metadata: {
        withdrawalId: pendingWithdrawal._id,
        amount: pendingWithdrawal.amount
      }
    });

    throw new ApiError(409, "You already have a pending withdrawal request");
  }

  const recentWithdrawal = await Withdrawal.findOne({
    userId
  }).sort({ createdAt: -1 });

  if (recentWithdrawal && Date.now() - recentWithdrawal.createdAt.getTime() < WITHDRAWAL_COOLDOWN_MS) {
    await recordSecurityEvent({
      userId,
      actionType: "withdrawal_cooldown",
      reason: "Withdrawal cooldown is active",
      severity: "medium",
      blocked: true,
      route: req.originalUrl,
      ipAddress: req.ip,
      metadata: {
        lastWithdrawalId: recentWithdrawal._id,
        amount: parsedAmount
      }
    });

    const remainingMinutes = Math.ceil(
      (WITHDRAWAL_COOLDOWN_MS - (Date.now() - recentWithdrawal.createdAt.getTime())) / 60000
    );

    throw new ApiError(
      429,
      `Withdrawal cooldown active. Please wait about ${remainingMinutes} minute(s) before creating another request.`
    );
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

  void notifyWithdrawalRequested({
    userId,
    amount: parsedAmount,
    upiId: upiId.trim().toLowerCase()
  });

  return res.status(201).json(
    new ApiResponse(201, withdrawal, "Withdrawal request created")
  );
});


export const getMyWithdrawals = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const withdrawals = await Withdrawal.find({ userId })
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, withdrawals, "Withdrawal history fetched")
  );
});

export const getPendingWithdrawals = asyncHandler(async (req, res) => {
  const withdrawals = await Withdrawal.find({ status: "pending" })
    .populate("userId", "fullName phoneNumber")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, withdrawals, "Pending withdrawals fetched")
  );
});

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

    await notifyWithdrawalApproved({
      userId: withdrawal.userId,
      amount: withdrawal.amount
    });

    return res.status(200).json(
      new ApiResponse(200, withdrawal, "Withdrawal approved")
    );

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

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

    void notifyWithdrawalRejected({
      userId: withdrawal.userId,
      amount: withdrawal.amount,
      reason: withdrawal.rejectionReason
    });

    return res.status(200).json(
      new ApiResponse(200, withdrawal, "Withdrawal rejected")
    );

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});