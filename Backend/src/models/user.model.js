import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
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

  accessToken: {
    type: String,
    default: null
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

userSchema.methods.generateAccessToken = function () {
  const jwtSecret = process.env.ACCESS_TOKEN_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT secret is not configured");
  }

  const token = jwt.sign(
    {
      id: this._id,
      phoneNumber: this.phoneNumber
    },
    jwtSecret,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "7d"
    }
  );

  this.accessToken = token;
  return token;
};

export const User = mongoose.model("User", userSchema);
