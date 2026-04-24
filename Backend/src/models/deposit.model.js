import mongoose, { Schema } from "mongoose";

const depositSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending"
    },
    paymentRef: {
      type: String 
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    reviewedAt: {
      type: Date
    },
    rejectionReason: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

depositSchema.index({ userId: 1, status: 1, createdAt: -1 });

export const Deposit = mongoose.model("Deposit", depositSchema);