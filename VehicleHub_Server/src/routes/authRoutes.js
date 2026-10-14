import express from "express";
import * as authController from "../controllers/authController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

import {
  sendEmailOTP,
  verifyEmailOTP,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

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

// Email OTP endpoints
router.get("/send-otp", (req, res) => res.status(405).json({ success: false, message: "Use POST /api/auth/send-otp" }));
router.post("/send-otp", sendEmailOTP);

router.get("/verify-otp", (req, res) => res.status(405).json({ success: false, message: "Use POST /api/auth/verify-otp" }));
router.post("/verify-otp", verifyEmailOTP);

export default router;
