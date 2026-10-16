// VehicleHub/VehicleHub_Server/src/routes/index.js
import express from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import vehicleRoutes from "./vehicleRoutes.js";
import brandRoutes from "./brandRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import inquiryRoutes from "./inquiryRoutes.js";
import wishlistRoutes from "./wishlistRoutes.js";
import inspectionRoutes from "./inspectionRoutes.js";
import financeRoutes from "./financeRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import subscriptionRoutes from "./subscriptionRoutes.js";
import reportRoutes from "./reportRoutes.js";
import uploadRoutes from "./uploadRoutes.js";
import buyerRoutes from "./buyerRoutes.js";
import adminRoutes from "./adminRoutes.js";
import fieldInspectorRoutes from "./fieldInspectorRoutes.js";
import conversationRoutes from "./conversationRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/vehicles", vehicleRoutes);
router.use("/brands", brandRoutes);
router.use("/categories", categoryRoutes);
router.use("/inquiries", inquiryRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/inspections", inspectionRoutes);
router.use("/finance", financeRoutes);
router.use("/payments", paymentRoutes);
router.use("/notifications", notificationRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/reports", reportRoutes);
router.use("/uploads", uploadRoutes);
router.use("/buyer", buyerRoutes); // buyer panel + purchase requests
router.use("/admin", adminRoutes); // admin panel
router.use("/field-inspector", fieldInspectorRoutes); // field inspector panel
router.use("/conversations", conversationRoutes); // the signed-in user's own chats

export default router;