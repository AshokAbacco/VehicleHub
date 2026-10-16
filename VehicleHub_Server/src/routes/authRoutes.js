// VehicleHub/VehicleHub_Server/src/routes/authRoutes.js
// Mounted at /api/auth. Sign-in is email / mobile number + password (OTP sign-in removed).
import express from "express";
import rateLimit from "express-rate-limit";
import * as authController from "../controllers/authController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

// Slow down password guessing: 20 sign-in / sign-up attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Please wait a few minutes and try again." },
});

router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);

router.post("/logout", authController.logout);
router.post("/refresh-token", authController.refreshToken);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.get("/verify-email", authController.verifyEmail);
router.post(
  "/change-password",
  authenticateUser,
  authController.changePassword,
);
router.get("/me", authenticateUser, authController.getCurrentUser);

export default router;