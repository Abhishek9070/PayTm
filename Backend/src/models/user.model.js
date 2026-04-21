import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    lowercase: true,
    trim: true,
    sparse: true
  },

  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    match: /^\d{10}$/
  },

  upiId: {
    type: String,
    unique: true,
    sparse: true
  },

  qrCode: {
    type: String
  },

  isVerified: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

export const User = mongoose.model("User", userSchema);