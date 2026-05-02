import { User } from "../models/user.model.js";
import { Deposit } from "../models/deposit.model.js";
import { Withdrawal } from "../models/withdraw.model.js";
import { Transaction } from "../models/transaction.model.js";
import { PaymentOrder } from "../models/paymentOrder.model.js";
import { SecurityEvent } from "../models/securityEvent.model.js";
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