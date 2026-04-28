import mongoose, { Schema } from "mongoose";

const withdrawalSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  upiId: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  reviewedAt: Date,
  rejectionReason: String
}, { timestamps: true });

withdrawalSchema.index({ userId: 1, createdAt: -1 });
withdrawalSchema.index({ status: 1, createdAt: -1 });

export const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);