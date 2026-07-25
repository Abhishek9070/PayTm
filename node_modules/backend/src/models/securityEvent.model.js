import mongoose, { Schema } from "mongoose";

const securityEventSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true
    },
    actionType: {
      type: String,
      enum: [
        "rate_limit",
        "duplicate_payment",
        "duplicate_order",
        "withdrawal_cooldown",
        "suspicious_activity",
        "high_value_transaction"
      ],
      required: true,
      index: true
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
      index: true
    },
    blocked: {
      type: Boolean,
      default: true,
      index: true
    },
    route: {
      type: String,
      trim: true
    },
    ipAddress: {
      type: String,
      trim: true
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: null
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    resolvedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

securityEventSchema.index({ userId: 1, createdAt: -1 });
securityEventSchema.index({ actionType: 1, createdAt: -1 });

export const SecurityEvent = mongoose.model("SecurityEvent", securityEventSchema);