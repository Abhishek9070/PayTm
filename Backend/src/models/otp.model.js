import mongoose, { Schema } from "mongoose";

const otpSchema = new Schema({
  phoneNumber: {
    type: String,
    required: true,
    index: true
  },

  otp: {
    type: String,
    required: true
  },

  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } 
  }

}, { timestamps: true });

export const OTP = mongoose.model("OTP", otpSchema);