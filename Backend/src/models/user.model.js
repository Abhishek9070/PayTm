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

  refreshToken: {
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
  },

  isAdmin: {
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
      phoneNumber: this.phoneNumber,
      fullName:this.fullName
    },
    jwtSecret,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "2d"
    }
  );

  // this.accessToken = token; // no need to store in DB
  return token;
};
userSchema.methods.generateRefreshToken = function () {
  const jwtSecret =
    process.env.REFRESH_TOKEN_SECRET || process.env.REFRESH_TOKEN_SECRTE;

  if (!jwtSecret) {
    throw new Error("Refresh token secret is not configured");
  }

  const token = jwt.sign(
    {
      id: this._id,
    },
    jwtSecret,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "12d"
    }
  );

  return token;
};
export const User = mongoose.model("User", userSchema);
