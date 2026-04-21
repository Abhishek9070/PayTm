import { OTP } from "../models/otp.model.js";

export const sendOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = new Date(Date.now() + 1 * 60 * 1000);

    await OTP.deleteMany({ phoneNumber });

    await OTP.create({
      phoneNumber,
      otp,
      expiresAt
    });

    console.log(`OTP for ${phoneNumber}: ${otp}`);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully"
    });

  } catch (error) {
    console.error("Send OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};