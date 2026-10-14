import express from "express";
import * as paymentController from "../controllers/paymentController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateUser, paymentController.createPayment);
router.post("/success", authenticateUser, paymentController.paymentSuccess);
router.post("/failed", authenticateUser, paymentController.paymentFailed);
router.post("/:id/refund", authenticateUser, paymentController.refund);
router.get("/history", authenticateUser, paymentController.transactionHistory);

export default router;
