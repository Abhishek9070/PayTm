import mongoose from "mongoose";
import { Deposit } from "../models/deposit.model.js";
import { IncomingPayment } from "../models/incomingPayment.model.js";
import { Wallet } from "../models/walet.model.js";
import ApiError from "../utils/apiErros.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { createNotification } from "../utils/createNotification.js";

const toMoneyNumber = (value) => Number(value);

const isSameAmount = (left, right) => {
  return Number.isFinite(left) && Number.isFinite(right) && left === right;
};

const notifyDepositSuccess = async ({ deposit, session }) => {
  try {
    await createNotification(
      {
        userId: deposit.userId,
        title: "Deposit Approved",
        message: `₹${deposit.amount} added to your wallet successfully`,
        type: "deposit",
        metadata: {
          depositId: deposit._id,
          paymentRef: deposit.paymentRef,
          amount: deposit.amount
        }
      },
      { session }
    );
  } catch (error) {
    console.log("Deposit notification failed:", error.message);
  }
};

const creditDepositInTransaction = async ({ deposit, session, reviewerId = null }) => {
  const wallet = await Wallet.findOne({ userId: deposit.userId }).session(session);

  if (!wallet) {
    throw new ApiError(404, "Wallet not found for this user");
  }

  wallet.balance += deposit.amount;
  await wallet.save({ session });

  deposit.status = "success";
  deposit.reviewedBy = reviewerId;
  deposit.reviewedAt = new Date();
  await deposit.save({ session });

  await IncomingPayment.updateOne(
    { referenceId: deposit.paymentRef },
    {
      $set: {
        processed: true,
        matchedDepositId: deposit._id
      }
    },
    { session }
  );
};

const autoReconcileReference = async ({ referenceId }) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const incomingPayment = await IncomingPayment.findOne({ referenceId }).session(session);

    if (!incomingPayment) {
      await session.abortTransaction();
      session.endSession();
      return { status: "no_payment" };
    }

    if (incomingPayment.status !== "success") {
      await session.abortTransaction();
      session.endSession();
      return { status: "payment_not_success" };
    }

    if (incomingPayment.processed) {
      await session.abortTransaction();
      session.endSession();
      return { status: "already_processed" };
    }

    const deposit = await Deposit.findOne({
      paymentRef: referenceId,
      status: "pending"
    }).session(session);

    if (!deposit) {
      await session.abortTransaction();
      session.endSession();
      return { status: "no_pending_deposit" };
    }

    const incomingAmount = toMoneyNumber(incomingPayment.amount);

    if (!isSameAmount(incomingAmount, deposit.amount)) {
      throw new ApiError(409, "Payment amount does not match deposit request");
    }

    if (incomingPayment.paidToUpiId !== deposit.paidToUpiId) {
      throw new ApiError(409, "Payment destination UPI does not match deposit request");
    }

    await creditDepositInTransaction({ deposit, session, reviewerId: null });

    await session.commitTransaction();
    session.endSession();

    await notifyDepositSuccess({ deposit, session });

    return { status: "approved", deposit };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const createDeposit = asyncHandler(async (req, res) => {
  const { amount, paymentRef, paidToUpiId } = req.body;
  const normalizedAmount = Number(amount);
  const normalizedPaymentRef = String(paymentRef || "").trim();
  const normalizedPaidToUpiId = String(paidToUpiId || "").trim().toLowerCase();
  const adminUpiId = String(process.env.DEPOSIT_ADMIN_UPI_ID || "")
    .trim()
    .toLowerCase();

  if (!normalizedAmount || normalizedAmount <= 0) {
    throw new ApiError(400, "Invalid amount");
  }

  if (!adminUpiId) {
    throw new ApiError(500, "Deposit admin UPI is not configured");
  }

  if (!normalizedPaymentRef) {
    throw new ApiError(400, "paymentRef is required");
  }

  if (!normalizedPaidToUpiId) {
    throw new ApiError(400, "paidToUpiId is required");
  }

  if (normalizedPaidToUpiId !== adminUpiId) {
    throw new ApiError(400, "Deposit must be sent to the configured admin UPI");
  }

  const existingDeposit = await Deposit.findOne({ paymentRef: normalizedPaymentRef });

  if (existingDeposit) {
    throw new ApiError(409, "This payment reference has already been used");
  }

  const deposit = await Deposit.create({
    userId: req.user._id,
    amount: normalizedAmount,
    paymentRef: normalizedPaymentRef,
    paidToUpiId: normalizedPaidToUpiId
  });

  const reconciliationResult = await autoReconcileReference({
    referenceId: normalizedPaymentRef
  });

  if (reconciliationResult.status === "approved") {
    return res.status(201).json(
      new ApiResponse(201, reconciliationResult.deposit, "Deposit matched and credited automatically")
    );
  }

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

    await creditDepositInTransaction({ deposit, session, reviewerId: req.user._id });

    await session.commitTransaction();
    session.endSession();

    await notifyDepositSuccess({ deposit, session });

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

export const ingestIncomingPaymentWebhook = asyncHandler(async (req, res) => {
  const webhookSecret = String(process.env.DEPOSIT_WEBHOOK_SECRET || "").trim();
  const providedSecret = String(req.headers["x-deposit-webhook-secret"] || "").trim();

  if (!webhookSecret) {
    throw new ApiError(500, "Deposit webhook secret is not configured");
  }

  if (!providedSecret || providedSecret !== webhookSecret) {
    throw new ApiError(401, "Invalid webhook secret");
  }

  const { referenceId, amount, paidToUpiId, status = "success", provider = "upi" } = req.body;

  const normalizedReferenceId = String(referenceId || "").trim();
  const normalizedPaidToUpiId = String(paidToUpiId || "").trim().toLowerCase();
  const normalizedStatus = String(status || "").trim().toLowerCase();
  const normalizedAmount = toMoneyNumber(amount);
  const adminUpiId = String(process.env.DEPOSIT_ADMIN_UPI_ID || "")
    .trim()
    .toLowerCase();

  if (!normalizedReferenceId) {
    throw new ApiError(400, "referenceId is required");
  }

  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    throw new ApiError(400, "Invalid amount");
  }

  if (!["pending", "success", "failed"].includes(normalizedStatus)) {
    throw new ApiError(400, "Invalid payment status");
  }

  if (!adminUpiId) {
    throw new ApiError(500, "Deposit admin UPI is not configured");
  }

  if (!normalizedPaidToUpiId) {
    throw new ApiError(400, "paidToUpiId is required");
  }

  if (normalizedPaidToUpiId !== adminUpiId) {
    throw new ApiError(400, "Payment is not sent to configured admin UPI");
  }

  await IncomingPayment.findOneAndUpdate(
    { referenceId: normalizedReferenceId },
    {
      $set: {
        amount: normalizedAmount,
        paidToUpiId: normalizedPaidToUpiId,
        status: normalizedStatus,
        provider: String(provider || "upi").trim() || "upi",
        rawPayload: req.body
      }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );

  const reconciliationResult = await autoReconcileReference({ referenceId: normalizedReferenceId });

  return res.status(200).json(
    new ApiResponse(
      200,
      { referenceId: normalizedReferenceId, reconciliationStatus: reconciliationResult.status },
      "Incoming payment recorded"
    )
  );
});

export const reconcileMyDepositByReference = asyncHandler(async (req, res) => {
  const { paymentRef } = req.body;
  const normalizedPaymentRef = String(paymentRef || "").trim();

  if (!normalizedPaymentRef) {
    throw new ApiError(400, "paymentRef is required");
  }

  const deposit = await Deposit.findOne({
    userId: req.user._id,
    paymentRef: normalizedPaymentRef
  });

  if (!deposit) {
    throw new ApiError(404, "Deposit not found for this user");
  }

  if (deposit.status === "success") {
    return res.status(200).json(
      new ApiResponse(200, deposit, "Deposit is already approved")
    );
  }

  if (deposit.status !== "pending") {
    throw new ApiError(400, `Deposit is already ${deposit.status}`);
  }

  const reconciliationResult = await autoReconcileReference({
    referenceId: normalizedPaymentRef
  });

  const updatedDeposit = await Deposit.findById(deposit._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        deposit: updatedDeposit,
        reconciliationStatus: reconciliationResult.status
      },
      reconciliationResult.status === "approved"
        ? "Deposit matched and approved automatically"
        : "Deposit not auto-approved yet"
    )
  );
});