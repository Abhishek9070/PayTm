import mongoose from "mongoose";
import { Deposit } from "../models/deposit.model.js";
import { Wallet } from "../models/walet.model.js";
import ApiError from "../utils/apiErros.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createDeposit = asyncHandler(async (req, res) => {
  const { amount, paymentRef } = req.body;
  const normalizedAmount = Number(amount);

  if (!normalizedAmount || normalizedAmount <= 0) {
    throw new ApiError(400, "Invalid amount");
  }

  const deposit = await Deposit.create({
    userId: req.user._id,
    amount: normalizedAmount,
    paymentRef: paymentRef || null
  });

  return res.status(201).json(
    new ApiResponse(201, deposit, "Deposit request created and pending approval")
  );
});

export const getMyDeposits = asyncHandler(async (req, res) => {
  const deposits = await Deposit.find({ userId: req.user._id })
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, deposits, "Deposit requests fetched successfully")
  );
});

export const getPendingDeposits = asyncHandler(async (req, res) => {
  const deposits = await Deposit.find({ status: "pending" })
    .populate("userId", "fullName phoneNumber email")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, deposits, "Pending deposit requests fetched successfully")
  );
});

export const approveDeposit = asyncHandler(async (req, res) => {
  const { depositId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(depositId)) {
    throw new ApiError(400, "Invalid deposit id");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const deposit = await Deposit.findById(depositId).session(session);

    if (!deposit) {
      throw new ApiError(404, "Deposit not found");
    }

    if (deposit.status !== "pending") {
      throw new ApiError(400, `Deposit is already ${deposit.status}`);
    }

    const wallet = await Wallet.findOne({ userId: deposit.userId }).session(session);

    if (!wallet) {
      throw new ApiError(404, "Wallet not found for this user");
    }

    wallet.balance += deposit.amount;
    await wallet.save({ session });

    deposit.status = "success";
    deposit.reviewedBy = req.user._id;
    deposit.reviewedAt = new Date();
    await deposit.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json(
      new ApiResponse(200, deposit, "Deposit approved successfully")
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

export const rejectDeposit = asyncHandler(async (req, res) => {
  const { depositId } = req.params;
  const { rejectionReason } = req.body;

  if (!mongoose.Types.ObjectId.isValid(depositId)) {
    throw new ApiError(400, "Invalid deposit id");
  }

  const deposit = await Deposit.findById(depositId);

  if (!deposit) {
    throw new ApiError(404, "Deposit not found");
  }

  if (deposit.status !== "pending") {
    throw new ApiError(400, `Deposit is already ${deposit.status}`);
  }

  deposit.status = "failed";
  deposit.reviewedBy = req.user._id;
  deposit.reviewedAt = new Date();
  deposit.rejectionReason = rejectionReason || "Rejected by admin";
  await deposit.save();

  return res.status(200).json(
    new ApiResponse(200, deposit, "Deposit rejected successfully")
  );
});