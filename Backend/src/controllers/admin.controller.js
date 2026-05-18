import { User } from "../models/user.model.js";
import { Deposit } from "../models/deposit.model.js";
import { Withdrawal } from "../models/withdraw.model.js";
import { Transaction } from "../models/transaction.model.js";
import { PaymentOrder } from "../models/paymentOrder.model.js";
import { SecurityEvent } from "../models/securityEvent.model.js";
import { Wallet } from "../models/walet.model.js";
import ApiError from "../utils/apiErros.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const getMoneySummary = async (match) => {
  const [result] = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 }
      }
    }
  ]);

  return {
    totalAmount: result?.totalAmount || 0,
    count: result?.count || 0
  };
};

export const getAdminDashboardSummary = asyncHandler(async (req, res) => {
  const lookbackDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalVerifiedUsers,
    totalDeposits,
    totalWithdrawals,
    pendingDeposits,
    pendingWithdrawals,
    pendingPaymentOrders,
    activeSecurityEvents,
    successfulDeposits,
    successfulWithdrawals,
    successfulTransfers,
    failedTransactions,
    recentSecurityEvents,
    flaggedUsers
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isVerified: true }),
    Deposit.countDocuments(),
    Withdrawal.countDocuments(),
    Deposit.countDocuments({ status: "pending" }),
    Withdrawal.countDocuments({ status: "pending" }),
    PaymentOrder.countDocuments({ status: "pending" }),
    SecurityEvent.countDocuments({ createdAt: { $gte: lookbackDate } }),
    getMoneySummary({ type: "deposit", status: "success" }),
    getMoneySummary({ type: "withdrawal", status: "success" }),
    getMoneySummary({ type: "transfer", status: "success" }),
    Transaction.countDocuments({ status: "failed" }),
    SecurityEvent.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("userId", "fullName phoneNumber email isAdmin"),
    SecurityEvent.aggregate([
      {
        $match: {
          createdAt: { $gte: lookbackDate }
        }
      },
      {
        $group: {
          _id: "$userId",
          eventCount: { $sum: 1 },
          blockedCount: {
            $sum: {
              $cond: ["$blocked", 1, 0]
            }
          }
        }
      },
      { $sort: { eventCount: -1 } },
      { $limit: 10 }
    ])
  ]);

  const topFlaggedUsers = await Promise.all(
    flaggedUsers.map(async (item) => {
      if (!item._id) {
        return {
          user: null,
          eventCount: item.eventCount,
          blockedCount: item.blockedCount
        };
      }

      const user = await User.findById(item._id).select("fullName phoneNumber email isAdmin");

      return {
        user,
        eventCount: item.eventCount,
        blockedCount: item.blockedCount
      };
    })
  );

  const revenue = successfulDeposits.totalAmount - successfulWithdrawals.totalAmount;
  const pendingActions = {
    deposits: pendingDeposits,
    withdrawals: pendingWithdrawals,
    paymentOrders: pendingPaymentOrders,
    total: pendingDeposits + pendingWithdrawals + pendingPaymentOrders
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totals: {
          users: totalUsers,
          verifiedUsers: totalVerifiedUsers,
          deposits: totalDeposits,
          withdrawals: totalWithdrawals,
          failedTransactions
        },
        money: {
          successfulDeposits: successfulDeposits.totalAmount,
          successfulWithdrawals: successfulWithdrawals.totalAmount,
          successfulTransfers: successfulTransfers.totalAmount,
          revenue
        },
        pendingActions,
        fraud: {
          activeSecurityEvents,
          recentSecurityEvents,
          topFlaggedUsers
        }
      },
      "Admin dashboard summary fetched successfully"
    )
  );
});

export const getFraudEvents = asyncHandler(async (req, res) => {
  let { page = 1, limit = 20, actionType, severity } = req.query;

  page = Number.parseInt(page, 10);
  limit = Number.parseInt(limit, 10);

  if (!Number.isInteger(page) || page < 1) {
    throw new ApiError(400, "page must be a positive integer");
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new ApiError(400, "limit must be between 1 and 100");
  }

  const query = {};

  if (actionType) {
    query.actionType = String(actionType).trim();
  }

  if (severity) {
    query.severity = String(severity).trim();
  }

  const skip = (page - 1) * limit;

  const [events, total] = await Promise.all([
    SecurityEvent.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "fullName phoneNumber email isAdmin"),
    SecurityEvent.countDocuments(query)
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        events,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      },
      "Fraud events fetched successfully"
    )
  );
});

export const getPendingActionsOverview = asyncHandler(async (req, res) => {
  const [pendingDeposits, pendingWithdrawals, pendingPaymentOrders] = await Promise.all([
    Deposit.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("userId", "fullName phoneNumber email"),
    Withdrawal.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("userId", "fullName phoneNumber email"),
    PaymentOrder.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("userId", "fullName phoneNumber email")
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        deposits: pendingDeposits,
        withdrawals: pendingWithdrawals,
        paymentOrders: pendingPaymentOrders,
        counts: {
          deposits: pendingDeposits.length,
          withdrawals: pendingWithdrawals.length,
          paymentOrders: pendingPaymentOrders.length,
          total: pendingDeposits.length + pendingWithdrawals.length + pendingPaymentOrders.length
        }
      },
      "Pending actions fetched successfully"
    )
  );
});

export const getAdminUsers = asyncHandler(async (req, res) => {
  let { q, page = 1, limit = 20, sortBy = "createdAt", sortDir = "desc", isBlocked, isFrozen, kycStatus } = req.query;

  page = Number.parseInt(page, 10);
  limit = Number.parseInt(limit, 10);

  if (!Number.isInteger(page) || page < 1) {
    throw new ApiError(400, "page must be a positive integer");
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 200) {
    throw new ApiError(400, "limit must be between 1 and 200");
  }

  const query = {};

  if (q) {
    const re = new RegExp(String(q).trim(), "i");
    query.$or = [{ fullName: re }, { email: re }, { phoneNumber: re }, { upiId: re }];
  }

  if (typeof isBlocked !== "undefined") {
    query.isBlocked = String(isBlocked) === "true";
  }

  if (typeof isFrozen !== "undefined") {
    query.isFrozen = String(isFrozen) === "true";
  }

  if (kycStatus) {
    query["kyc.status"] = String(kycStatus).trim();
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(query)
      .select("fullName email phoneNumber isVerified kyc isFrozen isBlocked createdAt")
      .sort({ [sortBy]: sortDir === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(query)
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      },
      "Users fetched successfully"
    )
  );
});

export const getAdminUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).select("-password").lean();

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const wallet = await Wallet.findOne({ userId: user._id }).lean();
  const transactions = await Transaction.find({ $or: [{ from: user._id }, { to: user._id }] })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return res.status(200).json(
    new ApiResponse(200, { user, wallet, transactions }, "User details fetched")
  );
});

export const freezeUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByIdAndUpdate(id, { isFrozen: true }, { new: true });
  if (!user) throw new ApiError(404, "User not found");

  await AdminAudit.create({ adminId: req.user._id, action: "freeze_user", targetUser: user._id, metadata: null });
  return res.status(200).json(new ApiResponse(200, { user }, "User frozen"));
});

export const unfreezeUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByIdAndUpdate(id, { isFrozen: false }, { new: true });
  if (!user) throw new ApiError(404, "User not found");

  await AdminAudit.create({ adminId: req.user._id, action: "unfreeze_user", targetUser: user._id, metadata: null });
  return res.status(200).json(new ApiResponse(200, { user }, "User unfrozen"));
});

export const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByIdAndUpdate(id, { isBlocked: true }, { new: true });
  if (!user) throw new ApiError(404, "User not found");
  await AdminAudit.create({ adminId: req.user._id, action: "block_user", targetUser: user._id, metadata: null });
  return res.status(200).json(new ApiResponse(200, { user }, "User blocked"));
});

export const getPendingKyc = asyncHandler(async (req, res) => {
  const pending = await User.find({ "kyc.status": "pending" })
    .select("fullName phoneNumber email kyc profileImage createdAt")
    .sort({ "kyc.submittedAt": -1 })
    .limit(100);

  return res.status(200).json(new ApiResponse(200, { pending }, "Pending KYC fetched"));
});

export const approveKyc = asyncHandler(async (req, res) => {
  const { id } = req.params; // id is userId

  const user = await User.findById(id);
  if (!user) throw new ApiError(404, "User not found");

  user.kyc = {
    ...user.kyc,
    status: "approved",
    reviewedAt: new Date(),
    reviewedBy: req.user._id,
    rejectionReason: null
  };
  user.isVerified = true;
  await user.save();

  // audit
  await AdminAudit.create({ adminId: req.user._id, action: "approve_kyc", targetUser: user._id, metadata: { kyc: user.kyc } });

  return res.status(200).json(new ApiResponse(200, { user }, "KYC approved"));
});

export const rejectKyc = asyncHandler(async (req, res) => {
  const { id } = req.params; // id is userId
  const { rejectionReason } = req.body;

  if (!rejectionReason || !String(rejectionReason).trim()) {
    throw new ApiError(400, "rejectionReason is required");
  }

  const user = await User.findById(id);
  if (!user) throw new ApiError(404, "User not found");

  user.kyc = {
    ...user.kyc,
    status: "rejected",
    reviewedAt: new Date(),
    reviewedBy: req.user._id,
    rejectionReason: String(rejectionReason).trim()
  };
  user.isVerified = false;
  await user.save();

  // audit
  await AdminAudit.create({ adminId: req.user._id, action: "reject_kyc", targetUser: user._id, metadata: { rejectionReason: user.kyc.rejectionReason } });

  return res.status(200).json(new ApiResponse(200, { user }, "KYC rejected"));
});

export const getAdminTransactions = asyncHandler(async (req, res) => {
  let {
    userId,
    minAmount,
    maxAmount,
    fromDate,
    toDate,
    status,
    type,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortDir = "desc",
    failed,
    suspicious,
    highValue,
    highValueAmount
  } = req.query;

  page = Number.parseInt(page, 10);
  limit = Number.parseInt(limit, 10);

  if (!Number.isInteger(page) || page < 1) throw new ApiError(400, "page must be a positive integer");
  if (!Number.isInteger(limit) || limit < 1 || limit > 500) throw new ApiError(400, "limit must be between 1 and 500");

  const query = {};

  if (userId) {
    // match any transaction involving this user
    query.$or = [
      { sender: userId },
      { receiver: userId },
      { userId: userId }
    ];
  }

  if (type) query.type = String(type).trim();
  if (status) query.status = String(status).trim();

  if (typeof failed !== "undefined") {
    if (String(failed) === "true") query.status = "failed";
  }

  if (minAmount) query.amount = { ...(query.amount || {}), $gte: Number(minAmount) };
  if (maxAmount) query.amount = { ...(query.amount || {}), $lte: Number(maxAmount) };

  if (fromDate || toDate) {
    query.createdAt = {};
    if (fromDate) query.createdAt.$gte = new Date(fromDate);
    if (toDate) query.createdAt.$lte = new Date(toDate);
  }

  // highValue and suspicious are convenience filters: if set, use amount threshold
  if (highValue === "true") {
    const threshold = Number(highValueAmount) || 100000; // default ₹100,000
    query.amount = { ...(query.amount || {}), $gte: threshold };
  }

  if (suspicious === "true") {
    // Basic heuristic: failed transactions OR very large amounts
    const threshold = Number(highValueAmount) || 100000;
    query.$or = query.$or || [];
    query.$or.push({ status: "failed" }, { amount: { $gte: threshold } });
  }

  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    Transaction.find(query)
      .sort({ [sortBy]: sortDir === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "fullName phoneNumber email")
      .populate("receiver", "fullName phoneNumber email")
      .populate("userId", "fullName phoneNumber email"),
    Transaction.countDocuments(query)
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }, "Transactions fetched successfully")
  );
});

export const getSecurityEvents = asyncHandler(async (req, res) => {
  let { actionType, severity, blocked, ipAddress, userId, fromDate, toDate, page = 1, limit = 50, sortBy = "createdAt", sortDir = "desc" } = req.query;

  page = Number.parseInt(page, 10);
  limit = Number.parseInt(limit, 10);
  if (!Number.isInteger(page) || page < 1) throw new ApiError(400, "page must be a positive integer");
  if (!Number.isInteger(limit) || limit < 1 || limit > 1000) throw new ApiError(400, "limit must be between 1 and 1000");

  const query = {};
  if (actionType) query.actionType = String(actionType).trim();
  if (severity) query.severity = String(severity).trim();
  if (typeof blocked !== "undefined") query.blocked = String(blocked) === "true";
  if (ipAddress) query.ipAddress = String(ipAddress).trim();
  if (userId) query.userId = userId;
  if (fromDate || toDate) {
    query.createdAt = {};
    if (fromDate) query.createdAt.$gte = new Date(fromDate);
    if (toDate) query.createdAt.$lte = new Date(toDate);
  }

  const skip = (page - 1) * limit;

  const [events, total] = await Promise.all([
    SecurityEvent.find(query)
      .sort({ [sortBy]: sortDir === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "fullName phoneNumber email"),
    SecurityEvent.countDocuments(query)
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      events,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }, "Security events fetched successfully")
  );
});