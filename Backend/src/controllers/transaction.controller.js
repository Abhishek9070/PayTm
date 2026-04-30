import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Transaction } from "../models/transaction.model.js";
import { Deposit } from "../models/deposit.model.js";
import { Withdrawal } from "../models/withdraw.model.js";
import { Wallet } from "../models/walet.model.js";
import { createNotification } from "../utils/createNotification.js";
import { sendSMS } from "../services/sms.service.js";
import ApiError from "../utils/apiErros.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const TRANSFER_STATUSES = new Set(["pending", "success", "failed"]);
const WITHDRAWAL_STATUSES = new Set(["pending", "approved", "rejected"]);

const parseStatusFilter = (status) => {
  if (!status) {
    return {
      transferStatuses: null,
      depositStatuses: null,
      withdrawalStatuses: null
    };
  }

  const normalized = String(status).trim().toLowerCase();

  const aliases = {
    success: ["success", "approved"],
    failed: ["failed", "rejected"],
    pending: ["pending"],
    approved: ["approved"],
    rejected: ["rejected"]
  };

  const rawValues = aliases[normalized] || [normalized];

  const transferStatuses = rawValues.filter((value) => TRANSFER_STATUSES.has(value));
  const withdrawalStatuses = rawValues.filter((value) => WITHDRAWAL_STATUSES.has(value));

  return {
    transferStatuses: transferStatuses.length ? transferStatuses : ["__none__"],
    depositStatuses: transferStatuses.length ? transferStatuses : ["__none__"],
    withdrawalStatuses: withdrawalStatuses.length ? withdrawalStatuses : ["__none__"]
  };
};

const parseDateRange = ({ startDate, endDate }) => {
  if (!startDate && !endDate) {
    return null;
  }

  const dateFilter = {};

  if (startDate) {
    const parsedStart = new Date(startDate);

    if (Number.isNaN(parsedStart.getTime())) {
      throw new ApiError(400, "Invalid startDate");
    }

    dateFilter.$gte = parsedStart;
  }

  if (endDate) {
    const parsedEnd = new Date(endDate);

    if (Number.isNaN(parsedEnd.getTime())) {
      throw new ApiError(400, "Invalid endDate");
    }

    dateFilter.$lte = parsedEnd;
  }

  return dateFilter;
};

export const sendMoney = asyncHandler(async (req, res) => {
  const { receiverId, amount } = req.body;
  const senderId = req.user._id;
  const parsedAmount = Number(amount);

  if (!receiverId || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
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

    if (senderWallet.balance < parsedAmount) {
      throw new ApiError(400, "Insufficient balance");
    }

    // Deduct from sender
    senderWallet.balance -= parsedAmount;
    await senderWallet.save({ session });

    // Add to receiver
    receiverWallet.balance += parsedAmount;
    await receiverWallet.save({ session });

    // Create transaction
    const [transaction] = await Transaction.create(
      [
        {
          type: "transfer",
          sender: senderId,
          receiver: receiverId,
          amount: parsedAmount,
          status: "success"
        }
      ],
      { session }
    );

    await createNotification(
      {
        userId: senderId,
        title: "Money Sent",
        message: `You sent ₹${parsedAmount}`,
        type: "transfer",
        metadata: {
          transactionId: transaction._id,
          direction: "send",
          amount: parsedAmount
        }
      },
      { session }
    );

    await createNotification(
      {
        userId: receiverId,
        title: "Money Received",
        message: `You received ₹${parsedAmount}`,
        type: "transfer",
        metadata: {
          transactionId: transaction._id,
          direction: "receive",
          amount: parsedAmount
        }
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    void Promise.allSettled([
      sendSMS({
        to: sender.phoneNumber,
        message: `You sent ₹${parsedAmount} successfully`
      }),
      sendSMS({
        to: receiver.phoneNumber,
        message: `You received ₹${parsedAmount} successfully`
      })
    ]);

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
  const userIdStr = userId.toString();

  let {
    page = 1,
    limit = 10,
    type,
    status,
    startDate,
    endDate,
    sort = "desc"
  } = req.query;

  page = Number.parseInt(page, 10);
  limit = Number.parseInt(limit, 10);

  if (!Number.isInteger(page) || page < 1) {
    throw new ApiError(400, "page must be a positive integer");
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new ApiError(400, "limit must be between 1 and 100");
  }

  const normalizedSort = String(sort).toLowerCase() === "asc" ? "asc" : "desc";
  const normalizedType = type ? String(type).trim().toLowerCase() : null;
  const validTypes = ["transfer", "deposit", "withdrawal", "send", "receive"];

  if (normalizedType && !validTypes.includes(normalizedType)) {
    throw new ApiError(400, "type must be one of transfer, deposit, withdrawal, send, receive");
  }

  const skip = (page - 1) * limit;

  const includeTransfer = !normalizedType || ["transfer", "send", "receive"].includes(normalizedType);
  const includeDeposit = !normalizedType || normalizedType === "deposit";
  const includeWithdrawal = !normalizedType || normalizedType === "withdrawal";

  const dateRange = parseDateRange({ startDate, endDate });
  const statusFilters = parseStatusFilter(status);

  const transferQuery = normalizedType === "send"
    ? { sender: userId }
    : normalizedType === "receive"
      ? { receiver: userId }
      : {
          $or: [
            { sender: userId },
            { receiver: userId }
          ]
        };

  if (dateRange) {
    transferQuery.createdAt = dateRange;
  }

  if (statusFilters.transferStatuses) {
    transferQuery.status = { $in: statusFilters.transferStatuses };
  }

  const depositQuery = { userId };

  if (dateRange) {
    depositQuery.createdAt = dateRange;
  }

  if (statusFilters.depositStatuses) {
    depositQuery.status = { $in: statusFilters.depositStatuses };
  }

  const withdrawalQuery = { userId };

  if (dateRange) {
    withdrawalQuery.createdAt = dateRange;
  }

  if (statusFilters.withdrawalStatuses) {
    withdrawalQuery.status = { $in: statusFilters.withdrawalStatuses };
  }

  const [transferRows, depositRows, withdrawalRows] = await Promise.all([
    includeTransfer
      ? Transaction.find(transferQuery)
        .populate("sender", "fullName phoneNumber")
        .populate("receiver", "fullName phoneNumber")
      : Promise.resolve([]),
    includeDeposit
      ? Deposit.find(depositQuery)
      : Promise.resolve([]),
    includeWithdrawal
      ? Withdrawal.find(withdrawalQuery)
      : Promise.resolve([])
  ]);

  const transferItems = transferRows.map((tx) => {
    const senderId = tx.sender?._id?.toString?.() || tx.sender?.toString?.();
    const isSend = senderId === userIdStr;
    const counterparty = isSend ? tx.receiver : tx.sender;

    return {
      id: tx._id,
      type: "transfer",
      direction: isSend ? "send" : "receive",
      amount: tx.amount,
      status: tx.status,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt,
      counterparty,
      metadata: null
    };
  });

  const depositItems = depositRows.map((deposit) => ({
    id: deposit._id,
    type: "deposit",
    direction: "receive",
    amount: deposit.amount,
    status: deposit.status,
    createdAt: deposit.createdAt,
    updatedAt: deposit.updatedAt,
    counterparty: null,
    metadata: {
      paymentRef: deposit.paymentRef,
      paidToUpiId: deposit.paidToUpiId,
      rejectionReason: deposit.rejectionReason || null
    }
  }));

  const withdrawalItems = withdrawalRows.map((withdrawal) => ({
    id: withdrawal._id,
    type: "withdrawal",
    direction: "send",
    amount: withdrawal.amount,
    status: withdrawal.status,
    createdAt: withdrawal.createdAt,
    updatedAt: withdrawal.updatedAt,
    counterparty: null,
    metadata: {
      upiId: withdrawal.upiId,
      rejectionReason: withdrawal.rejectionReason || null
    }
  }));

  const allItems = [...transferItems, ...depositItems, ...withdrawalItems].sort((left, right) => {
    const leftTime = new Date(left.createdAt).getTime();
    const rightTime = new Date(right.createdAt).getTime();

    return normalizedSort === "asc" ? leftTime - rightTime : rightTime - leftTime;
  });

  const transactions = allItems.slice(skip, skip + limit);
  const total = allItems.length;
  const totalPages = Math.ceil(total / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        transactions,
        pagination: {
          total,
          page,
          limit,
          totalPages
        }
      },
      "Transaction history fetched successfully"
    )
  );
});