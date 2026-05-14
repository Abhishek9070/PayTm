import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
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

  password: {
    type: String,
    required: true,
    select: false
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

  profileImage: {
    type: fileAssetSchema,
    default: () => ({})
  },

  kyc: {
    status: {
      type: String,
      enum: ["not_submitted", "pending", "approved", "rejected"],
      default: "not_submitted"
    },
    documentType: {
      type: String,
      enum: ["aadhaar", "pan"],
      default: null
    },
    fullName: {
      type: String,
      default: null,
      trim: true
    },
    phoneNumber: {
      type: String,
      default: null,
      trim: true
    },
    address: {
      type: String,
      default: null,
      trim: true
    },
    gender: {
      type: String,
      default: null,
      trim: true
    },
    aadhaarNumber: {
      type: String,
      default: null,
      trim: true
    },
    panNumber: {
      type: String,
      default: null,
      trim: true
    },
    documentImage: {
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

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model("User", userSchema);
