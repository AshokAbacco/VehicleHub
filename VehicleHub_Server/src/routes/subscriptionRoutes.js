import express from "express";
import * as subscriptionController from "../controllers/subscriptionController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateUser, subscriptionController.createSubscription);
router.post("/upgrade", authenticateUser, subscriptionController.upgradePlan);
router.post("/cancel", authenticateUser, subscriptionController.cancelPlan);
router.get("/history", authenticateUser, subscriptionController.paymentHistory);

export default router;
