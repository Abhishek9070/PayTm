import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
const fileAssetSchema = new Schema(
  {
    url: {
      type: String,
      default: null
    },
    publicId: {
      type: String,
      default: null
    },
    mimeType: {
      type: String,
      default: null
    },
    uploadedAt: {
      type: Date,
      default: null
    }
  },
  { _id: false }
);

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

  kyc: {
    status: {
      type: String,
      enum: ["not_submitted", "pending", "approved", "rejected"],
      default: "not_submitted"
    },
    profileImage: {
      type: fileAssetSchema,
      default: () => ({})
    },
    aadhaarImage: {
      type: fileAssetSchema,
      default: () => ({})
    },
    panImage: {
      type: fileAssetSchema,
      default: () => ({})
    },
    submittedAt: {
      type: Date,
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    rejectionReason: {
      type: String,
      default: null
    }
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

  // this.accessToken = token;  no need to store in DB
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
