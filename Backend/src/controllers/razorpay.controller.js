import crypto from "crypto";
import mongoose from "mongoose";
import { razorpayInstance } from "../config/razorpay.js";

import { Wallet } from "../models/walet.model.js";
import { PaymentOrder } from "../models/paymentOrder.model.js";
import { Transaction } from "../models/transaction.model.js";
import {
  consumeActionRateLimit,
  HIGH_VALUE_TRANSACTION_THRESHOLD,
  PAYMENT_ORDER_COOLDOWN_MS,
  recordSecurityEvent
} from "../utils/fraudProtection.js";

import ApiError from "../utils/apiErros.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  const parsedAmount = Number(amount);

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    throw new ApiError(400, "Invalid amount");
  }

  await consumeActionRateLimit({
    userId: req.user._id.toString(),
    action: "payment_order",
    limit: 5,
    windowMs: 10 * 60 * 1000,
    reason: "Too many payment order requests. Please wait before trying again.",
    route: req.originalUrl,
    ipAddress: req.ip,
    metadata: {
      amount: parsedAmount
    }
  });

  const recentPendingOrder = await PaymentOrder.findOne({
    userId: req.user._id,
    amount: parsedAmount,
    status: "pending",
    createdAt: {
      $gte: new Date(Date.now() - PAYMENT_ORDER_COOLDOWN_MS)
    }
  }).sort({ createdAt: -1 });

  if (recentPendingOrder) {
    await recordSecurityEvent({
      userId: req.user._id,
      actionType: "duplicate_order",
      reason: "Duplicate payment order request detected",
      severity: "medium",
      blocked: true,
      route: req.originalUrl,
      ipAddress: req.ip,
      metadata: {
        paymentOrderId: recentPendingOrder._id,
        amount: parsedAmount
      }
    });

    try {
      const existingOrder = await razorpayInstance.orders.fetch(recentPendingOrder.razorpayOrderId);

      return res.status(200).json(
        new ApiResponse(200, existingOrder, "Existing pending payment order returned")
      );
    } catch (error) {
      console.log("Failed to fetch existing Razorpay order:", error.message);
    }
  }

  if (parsedAmount >= HIGH_VALUE_TRANSACTION_THRESHOLD) {
    void recordSecurityEvent({
      userId: req.user._id,
      actionType: "high_value_transaction",
      reason: `High value payment order created for ₹${parsedAmount}`,
      severity: "high",
      blocked: false,
      route: req.originalUrl,
      ipAddress: req.ip,
      metadata: {
        amount: parsedAmount
      }
    });
  }


  const options = {
    amount: parsedAmount * 100,
    currency: "INR",
    receipt: `receipt_${Date.now()}`
  };


  const order = await razorpayInstance.orders.create(options);

  await PaymentOrder.create({
    userId: req.user._id,
    amount: parsedAmount,
    razorpayOrderId: order.id,
    currency: order.currency,
    status: "pending"
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      order,
      "Razorpay order created successfully"
    )
  );
});



export const verifyRazorpayPayment = asyncHandler(async (req, res) => {

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  } = req.body;


  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature
  ) {
    throw new ApiError(400, "Payment verification data missing");
  }


  const generatedSignature = crypto
    .createHmac(
      "sha256",
      process.env.RAZORPAY_KEY_SECRET
    )
    .update(
      `${razorpay_order_id}|${razorpay_payment_id}`
    )
    .digest("hex");


  if (generatedSignature !== razorpay_signature) {
    throw new ApiError(400, "Invalid payment signature");
  }

  const order = await razorpayInstance.orders.fetch(
    razorpay_order_id
  );

  if (!order) {
    throw new ApiError(404, "Razorpay order not found");
  }

  const payment = await razorpayInstance.payments.fetch(
    razorpay_payment_id
  );

  if (!payment) {
    throw new ApiError(404, "Razorpay payment not found");
  }


  if (payment.status !== "captured") {
    throw new ApiError(400, "Payment not captured");
  }


  if (payment.order_id !== razorpay_order_id) {
    throw new ApiError(400, "Payment does not belong to this order");
  }
  const pendingOrder = await PaymentOrder.findOne({
    userId: req.user._id,
    razorpayOrderId: razorpay_order_id,
    status: "pending"
  });

  if (!pendingOrder) {
    throw new ApiError(404, "Pending payment order not found");
  }

  if (pendingOrder.amount * 100 !== order.amount) {
    throw new ApiError(400, "Amount mismatch with pending payment order");
  }

  if (payment.amount !== order.amount) {
    throw new ApiError(400, "Payment amount mismatch");
  }

  const amount = pendingOrder.amount;

  const session = await mongoose.startSession();

  session.startTransaction();

  try {

    const wallet = await Wallet.findOne({
      userId: req.user._id
    }).session(session);

    if (!wallet) {
      throw new ApiError(404, "Wallet not found");
    }

    const existingTransaction = await Transaction.findOne({
      razorpayPaymentId: razorpay_payment_id
    }).session(session);

    if (existingTransaction) {
      throw new ApiError(409, "Payment already processed");
    }

    pendingOrder.status = "completed";
    pendingOrder.razorpayPaymentId = razorpay_payment_id;
    pendingOrder.completedAt = new Date();

    await pendingOrder.save({ session });

    wallet.balance += amount;

    await wallet.save({ session });

    const [transaction] = await Transaction.create(
      [
        {
          type: "deposit",
          receiver: req.user._id,
          amount,
          status: "success",

          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id
        }
      ],
      { session }
    );

    await session.commitTransaction();

    session.endSession();

    return res.status(200).json(
      new ApiResponse(
        200,
        transaction,
        "Payment verified and wallet credited"
      )
    );

  } catch (error) {

    await session.abortTransaction();

    session.endSession();

    throw error;
  }
});

export const handleRazorpayWebhook = asyncHandler(async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new ApiError(500, "Razorpay webhook secret is not configured");
  }

  const razorpaySignature = req.headers["x-razorpay-signature"];

  if (!razorpaySignature) {
    throw new ApiError(400, "Missing Razorpay webhook signature");
  }

  const rawBody = Buffer.isBuffer(req.body)
    ? req.body
    : Buffer.from(typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {}));

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    throw new ApiError(400, "Invalid Razorpay webhook signature");
  }

  const payload = JSON.parse(rawBody.toString("utf8"));

  const paymentEntity = payload?.payload?.payment?.entity;

  if (!paymentEntity?.order_id) {
    throw new ApiError(400, "Malformed Razorpay webhook payload");
  }

  const pendingOrder = await PaymentOrder.findOne({
    razorpayOrderId: paymentEntity.order_id
  });

  if (!pendingOrder) {
    return res.status(200).json(new ApiResponse(200, null, "Webhook received for unknown order"));
  }

  if (pendingOrder.status === "completed" && pendingOrder.razorpayPaymentId === paymentEntity.id) {
    return res.status(200).json(new ApiResponse(200, null, "Webhook already processed"));
  }

  if (payload.event === "payment.failed") {
    if (pendingOrder.status === "failed" && pendingOrder.razorpayPaymentId === paymentEntity.id) {
      return res.status(200).json(new ApiResponse(200, null, "Failed webhook already processed"));
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      pendingOrder.status = "failed";
      pendingOrder.razorpayPaymentId = paymentEntity.id || pendingOrder.razorpayPaymentId;
      pendingOrder.failureReason = paymentEntity.error_reason || paymentEntity.error_description || paymentEntity.description || "Payment failed";
      pendingOrder.failedAt = new Date();

      await pendingOrder.save({ session });

      const existingFailedTransaction = await Transaction.findOne({
        razorpayPaymentId: paymentEntity.id
      }).session(session);

      if (!existingFailedTransaction) {
        const [failedTransaction] = await Transaction.create(
          [
            {
              type: "deposit",
              receiver: pendingOrder.userId,
              amount: pendingOrder.amount,
              status: "failed",
              razorpayOrderId: paymentEntity.order_id,
              razorpayPaymentId: paymentEntity.id
            }
          ],
          { session }
        );

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json(
          new ApiResponse(200, failedTransaction, "Failed payment recorded")
        );
      }

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json(new ApiResponse(200, null, "Failed webhook already recorded"));
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  if (payload.event !== "payment.captured") {
    return res.status(200).json(new ApiResponse(200, null, "Webhook ignored"));
  }

  if (pendingOrder.amount * 100 !== paymentEntity.amount) {
    throw new ApiError(400, "Webhook amount does not match pending order");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingTransaction = await Transaction.findOne({
      razorpayPaymentId: paymentEntity.id
    }).session(session);

    if (existingTransaction) {
      pendingOrder.status = "completed";
      pendingOrder.razorpayPaymentId = paymentEntity.id;
      pendingOrder.completedAt = new Date();

      await pendingOrder.save({ session });

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json(new ApiResponse(200, null, "Webhook already processed"));
    }

    const wallet = await Wallet.findOne({
      userId: pendingOrder.userId
    }).session(session);

    if (!wallet) {
      throw new ApiError(404, "Wallet not found for webhook payment order");
    }

    pendingOrder.status = "completed";
    pendingOrder.razorpayPaymentId = paymentEntity.id;
    pendingOrder.completedAt = new Date();

    await pendingOrder.save({ session });

    wallet.balance += pendingOrder.amount;

    await wallet.save({ session });

    const [transaction] = await Transaction.create(
      [
        {
          type: "deposit",
          receiver: pendingOrder.userId,
          amount: pendingOrder.amount,
          status: "success",
          razorpayOrderId: paymentEntity.order_id,
          razorpayPaymentId: paymentEntity.id
        }
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json(
      new ApiResponse(200, transaction, "Razorpay webhook processed successfully")
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});