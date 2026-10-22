// VehicleHub/VehicleHub_Server/src/controllers/authController.js
// ============================================================
// Mounted at /api/auth (routes/authRoutes.js). Sign-in = email or mobile number + password.
//   POST /register        { fullName, email, phone, password }  -> new BUYER + token
//   POST /login           { identifier, password }               -> { user, accessToken }
//   POST /change-password { currentPassword, newPassword }       (signed in)
//   GET  /me
//   POST /forgot-password, /verify-reset-otp, /reset-password  (password reset by email OTP)
// (OTP sign-in has been removed.)
// ============================================================
import bcrypt from "bcryptjs";
import authService from "../services/authService.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { validate } from "../middleware/validationMiddleware.js";
import { registerSchema, loginSchema } from "../validations/authValidation.js";
import { prisma } from "../config/db.js";
import * as passwordReset from "../services/passwordReset.js";

export const register = [
  validate(registerSchema),
  async (req, res, next) => {
    try {
      const result = await authService.register(req.body);
      sendSuccess(res, "Account created", result, 201);
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
export const refreshToken = (req, res) => sendSuccess(res, "Refresh token endpoint ready");

// ---------- Forgot password (email OTP from MS_SMTP_USER) — services/passwordReset.js ----------
// POST /forgot-password      { identifier }                                  -> code emailed
// POST /verify-reset-otp     { identifier, otp }                             -> { resetToken }
// POST /reset-password       { resetToken, password, confirmPassword }       -> password changed
export const forgotPassword = async (req, res, next) => {
  try {
    const identifier = String(req.body?.identifier || req.body?.email || "").trim();
    if (!identifier) return sendError(res, "Enter your email or mobile number", 400);
    const result = await passwordReset.requestReset(identifier);
    const message = result.sent
      ? `We've sent a 6-digit code to ${result.sentTo}.`
      : "If an account matches, we've sent a 6-digit code to its registered email.";
    return sendSuccess(res, message, result.sent ? result : { sent: false, resendIn: passwordReset.RESEND_SECONDS });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message, data: error.data || null });
    next(error);
  }
};

export const verifyResetOtp = async (req, res, next) => {
  try {
    const result = await passwordReset.verifyCode(req.body?.identifier, req.body?.otp);
    return sendSuccess(res, "Code verified", result);
  } catch (error) {
    if (error.statusCode) return sendError(res, error.message, error.statusCode);
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, password, confirmPassword } = req.body || {};
    await passwordReset.resetPassword(resetToken, password, confirmPassword);
    return sendSuccess(res, "Your password has been changed. You can now sign in with your new password.");
  } catch (error) {
    if (error.statusCode) return sendError(res, error.message, error.statusCode);
    next(error);
  }
};
export const verifyEmail = (req, res) => sendSuccess(res, "Email verified");

export const changePassword = async (req, res, next) => {
  try {
    if (!req.user) return sendError(res, "Please sign in again", 401);
    const { currentPassword, newPassword } = req.body || {};
    if (!newPassword || String(newPassword).length < 8) return sendError(res, "New password must be at least 8 characters", 400);
    if (req.user.password && !(await bcrypt.compare(String(currentPassword || ""), req.user.password))) {
      return sendError(res, "Current password is incorrect", 400);
    }
    await prisma.user.update({ where: { id: req.user.id }, data: { password: await bcrypt.hash(String(newPassword), 10) } });
    return sendSuccess(res, "Password changed");
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = (req, res) => {
  if (!req.user) return sendError(res, "No authenticated user", 401);
  // Never send the password hash to the browser
  const { password, ...user } = req.user;
  sendSuccess(res, "Current user fetched", { user });
};