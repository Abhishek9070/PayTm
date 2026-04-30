import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    message: {
      type: String,
      required: true,
      trim: true
    },

    type: {
      type: String,
      enum: [
        "transfer",
        "deposit",
        "withdrawal",
        "payment"
      ],
      required: true
    },

    isRead: {
      type: Boolean,
      default: false
    },

    metadata: {
      type: Schema.Types.Mixed,
      default: null
    }
  },
  { timestamps: true }
);

notificationSchema.index({
  userId: 1,
  createdAt: -1
});

export const Notification = mongoose.model(
  "Notification",
  notificationSchema
);