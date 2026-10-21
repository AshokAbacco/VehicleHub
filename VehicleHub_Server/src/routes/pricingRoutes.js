// VehicleHub/VehicleHub_Server/src/routes/pricingRoutes.js
// Pricing page (public — guests can buy a plan; a signed-in user is recorded if present).
//   GET  /api/pricing/plans
//   POST /api/pricing/check-account -> is this email / phone already registered?
//   POST /api/pricing/order    -> Razorpay order (amount worked out on the server; refused if the email/phone is taken)
//   POST /api/pricing/verify   -> verify with Razorpay, then save the payment
//   POST /api/pricing/webhook  -> Razorpay server-to-server events (signed with RAZORPAY_WEBHOOK_SECRET)
import express from "express";
import rateLimit from "express-rate-limit";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { getPlans, checkAccount, createOrder, verifyPayment, razorpayWebhook } from "../controllers/pricingController.js";

const router = express.Router();

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many payment attempts. Please wait a few minutes and try again." },
});

router.get("/plans", getPlans);
router.post("/check-account", paymentLimiter, authenticateUser, checkAccount); // email / phone already registered?
router.post("/order", paymentLimiter, authenticateUser, createOrder);
router.post("/verify", paymentLimiter, authenticateUser, verifyPayment);
router.post("/webhook", razorpayWebhook); // no rate limit / auth: Razorpay calls it, the signature is the check

export default router;