import mongoose, { Schema } from "mongoose";

const paymentOrderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 1
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    currency: {
      type: String,
      default: "INR",
      trim: true
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
      index: true
    },
    razorpayPaymentId: {
      type: String,
      trim: true,
      index: true
    },
    failureReason: {
      type: String,
      trim: true
    },
    failedAt: {
      type: Date
    },
    completedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

paymentOrderSchema.index({ userId: 1, status: 1, createdAt: -1 });

export const PaymentOrder = mongoose.model("PaymentOrder", paymentOrderSchema);
