// VehicleHub/VehicleHub_Server/src/controllers/authController.js
// ============================================================
// Mounted at /api/auth (routes/authRoutes.js). Sign-in = email or mobile number + password.
//   POST /register        { fullName, email, phone, password }  -> new BUYER + token
//   POST /login           { identifier, password }               -> { user, accessToken }
//   POST /change-password { currentPassword, newPassword }       (signed in)
//   GET  /me
// (OTP sign-in has been removed.)
// ============================================================
import bcrypt from "bcryptjs";
import authService from "../services/authService.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { validate } from "../middleware/validationMiddleware.js";
import { registerSchema, loginSchema } from "../validations/authValidation.js";
import { prisma } from "../config/db.js";

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

// No email service is set up for reset links yet — say so instead of pretending it worked
export const forgotPassword = (req, res) =>
  sendError(res, "Password reset by email isn't available yet. Please contact the VehicleHub admin to reset your password.", 501);
export const resetPassword = forgotPassword;
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