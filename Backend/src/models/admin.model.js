import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const adminSchema = new Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: true,
    select: false
  },

  role: {
    type: String,
    enum: ["super_admin", "support_admin", "finance_admin", "fraud_admin"],
    default: "support_admin"
  },

  permissions: {
    type: [String],
    default: []
  },

  lastLogin: {
    type: Date,
    default: null
  },

  isActive: {
    type: Boolean,
    default: true
  },

  refreshToken: {
    type: String,
    default: null
  }
}, { timestamps: true });

adminSchema.methods.generateAccessToken = function () {
  const jwtSecret = process.env.ADMIN_ACCESS_TOKEN_SECRET;

  if (!jwtSecret) {
    throw new Error("Admin JWT secret is not configured");
  }

  const token = jwt.sign(
    {
      id: this._id,
      email: this.email,
      fullName: this.fullName,
      role: this.role
    },
    jwtSecret,
    {
      expiresIn: process.env.ADMIN_ACCESS_TOKEN_EXPIRY || "7d"
    }
  );

  return token;
};

adminSchema.methods.generateRefreshToken = function () {
  const jwtSecret = process.env.ADMIN_REFRESH_TOKEN_SECRET;

  if (!jwtSecret) {
    throw new Error("Admin refresh token secret is not configured");
  }

  const token = jwt.sign(
    {
      id: this._id
    },
    jwtSecret,
    {
      expiresIn: process.env.ADMIN_REFRESH_TOKEN_EXPIRY || "30d"
    }
  );

  return token;
};

adminSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

adminSchema.methods.isPasswordCorrect = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export const Admin = mongoose.model("Admin", adminSchema);
