import express from "express";
import { authenticateUser, requireAuth } from "../middleware/authMiddleware.js";
import {
  sendOTP,
  verifyOTP,
  completeProfile,
} from "../controllers/OTPController.js";

const router = express.Router();

router.post("/phone/send-otp", sendOTP);
router.post("/phone/verify-otp", verifyOTP);

router.post(
  "/complete-profile",
  authenticateUser,
  requireAuth,
  completeProfile,
);

export default router;
