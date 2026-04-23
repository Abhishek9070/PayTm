import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Transaction } from "../models/transaction.model.js";
import { Wallet } from "../models/walet.model.js";
import ApiError from "../utils/apiErros.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const sendMoney = asyncHandler(async (req, res) => {
  const { receiverId, amount } = req.body;
  const senderId = req.user._id;

  if (!receiverId || !amount || amount <= 0) {
    throw new ApiError(400, "Invalid input");
  }

  if (senderId.toString() === receiverId) {
    throw new ApiError(400, "Cannot send money to yourself");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sender = await User.findById(senderId).session(session); // attaching this querry to transaction 
    const receiver = await User.findById(receiverId).session(session);
    const senderWallet = await Wallet.findOne({ userId: senderId }).session(session);
    const receiverWallet = await Wallet.findOne({ userId: receiverId }).session(session);

    if (!sender || !receiver) {
      throw new ApiError(404, "User not found");
    }

    if (!senderWallet || !receiverWallet) {
      throw new ApiError(404, "Wallet not found");
    }

    if (senderWallet.balance < amount) {
      throw new ApiError(400, "Insufficient balance");
    }

    // Deduct from sender
    senderWallet.balance -= amount;
    await senderWallet.save({ session });

    // Add to receiver
    receiverWallet.balance += amount;
    await receiverWallet.save({ session });

    // Create transaction
    const transaction = await Transaction.create(
      [
        {
          sender: senderId,
          receiver: receiverId,
          amount,
          status: "success"
        }
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json(
      new ApiResponse(200, transaction, "Transaction successful")
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

export const getTransactionHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const transactions = await Transaction.find({
    $or: [
      { sender: userId },
      { receiver: userId }
    ]
  })
    .populate("sender", "fullName phoneNumber")
    .populate("receiver", "fullName phoneNumber")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      transactions,
      "Transaction history fetched successfully"
    )
  );
});