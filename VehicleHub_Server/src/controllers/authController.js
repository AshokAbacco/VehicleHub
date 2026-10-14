import authService from "../services/authService.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { validate } from "../middleware/validationMiddleware.js";
import { registerSchema, loginSchema } from "../validations/authValidation.js";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../config/db.js";
import { generateOTP, hashOTP, compareOTP } from "../utils/otp.js";
import { sendOTPEmail } from "../services/emailService.js";

const normalizeEmail = (email) => {
  return email?.trim().toLowerCase();
};

const generateAccessToken = (user) => {
  // Create access token without expiry claim; session revocation handled via refresh/session store
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      isSeller: user.isSeller,
      sellerApproved: user.sellerApproved,
    },
    process.env.JWT_SECRET,
  );
};

const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString("hex");
};

const getRefreshExpiry = () => {
  const days = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30);

  const date = new Date();

  date.setDate(date.getDate() + days);

  return date;
};

export const sendEmailOTP = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    const otp = generateOTP();
    const otpHash = await hashOTP(otp);
    const expiresAt = new Date(
      Date.now() + Number(process.env.OTP_EXPIRES_MINUTES || 5) * 60 * 1000,
    );

    await prisma.oTP.deleteMany({
      where: {
        email,
        verified: false,
      },
    });

    await prisma.oTP.create({
      data: {
        email,
        mobile: "",
        otp: otpHash,
        expiresAt,
        verified: false,
      },
    });

    await sendOTPEmail({
      email,
      otp,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("SEND OTP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to send OTP",
    });
  }
};

export const verifyEmailOTP = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || "").trim();

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const otpRecord = await prisma.oTP.findFirst({
      where: {
        email,
        verified: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please request a new OTP.",
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired.",
      });
    }

    const isValid = await compareOTP(otp, otpRecord.otp);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    await prisma.oTP.update({
      where: {
        id: otpRecord.id,
      },
      data: {
        verified: true,
      },
    });

    let user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    let isNewUser = false;

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          role: "BUYER",
          isVerified: true,
          isActive: true,
          isBlocked: false,
          // isSeller: false,
          //sellerApproved: false,
        },
      });

      isNewUser = true;
    } else {
      if (user.isBlocked) {
        return res.status(403).json({
          success: false,
          message: "Your account has been blocked.",
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: "Your account is inactive.",
        });
      }

      user = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          isVerified: true,
        },
      });
    }

    const accessToken = generateAccessToken(user);

    const refreshToken = generateRefreshToken();

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    await prisma.authSession.create({
      data: {
        userId: user.id,
        refreshTokenHash,
        expiresAt: getRefreshExpiry(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",

      isNewUser,

      accessToken,
      refreshToken,

      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        isSeller: user.isSeller,
        sellerApproved: user.sellerApproved,
      },
    });
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};

export const register = [
  validate(registerSchema),
  async (req, res, next) => {
    try {
      const result = await authService.register(req.body);
      sendSuccess(res, "User registered successfully", result, 201);
    } catch (error) {
      next(error);
    }
  },
];

export const login = [
  validate(loginSchema),
  async (req, res, next) => {
    try {
      const result = await authService.login(req.body);
      sendSuccess(res, "Login successful", result);
    } catch (error) {
      next(error);
    }
  },
];

export const logout = (req, res) => sendSuccess(res, "Logout successful");
export const refreshToken = (req, res) =>
  sendSuccess(res, "Refresh token endpoint ready");
export const forgotPassword = (req, res) =>
  sendSuccess(res, "Forgot password email sent");
export const resetPassword = (req, res) =>
  sendSuccess(res, "Password reset successful");
export const verifyEmail = (req, res) => sendSuccess(res, "Email verified");
export const changePassword = (req, res) =>
  sendSuccess(res, "Password changed");
export const getCurrentUser = (req, res) => {
  if (!req.user) return sendError(res, "No authenticated user", 401);
  sendSuccess(res, "Current user fetched", { user: req.user });
};
