import mongoose, { Schema } from "mongoose";

const adminAuditSchema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "Admin", required: true, index: true },
    action: { type: String, required: true, trim: true },
    targetUser: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    metadata: { type: Schema.Types.Mixed, default: null }
  },
  { timestamps: true }
);

export const AdminAudit = mongoose.model("AdminAudit", adminAuditSchema);
