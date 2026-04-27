import mongoose, { Schema } from "mongoose";

const incomingPaymentSchema = new Schema(
  {
    referenceId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true
    },
    paidToUpiId: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "success"
    },
    provider: {
      type: String,
      trim: true,
      default: "upi"
    },
    processed: {
      type: Boolean,
      default: false
    },
    matchedDepositId: {
      type: Schema.Types.ObjectId,
      ref: "Deposit"
    },
    rawPayload: {
      type: Schema.Types.Mixed,
      default: null
    }
  },
  { timestamps: true }
);

incomingPaymentSchema.index({ status: 1, processed: 1, createdAt: -1 });

export const IncomingPayment = mongoose.model("IncomingPayment", incomingPaymentSchema);
