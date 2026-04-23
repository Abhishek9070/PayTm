import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
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

otpSchema.pre("save", async function () {
  if (!this.isModified("otp")) {
    return;
  }

  this.otp = await bcrypt.hash(this.otp, 10);
});

otpSchema.methods.isOtpCorrect = async function (enteredOtp) {
  return bcrypt.compare(enteredOtp, this.otp);
};

export const OTP = mongoose.model("OTP", otpSchema);