// VehicleHub/VehicleHub_Server/src/routes/adminRoutes.js
// Mounted at /api/admin (routes/index.js). Admin only.
import { Router } from "express";
import { authenticateUser, requireAuth, authorizeRoles } from "../middleware/authMiddleware.js";
import { getAdminBuyers, deleteAdminBuyer } from "../controllers/adminBuyerController.js";
import * as admin from "../controllers/adminController.js";

const router = Router();

router.use(authenticateUser, requireAuth, authorizeRoles("ADMIN"));

// Dashboard
router.get("/dashboard", admin.getDashboard);

// Vehicles
router.get("/vehicles", admin.getVehicles);
router.delete("/vehicles/:id", admin.deleteVehicle);

// Sellers: applications + approved sellers (fixed paths before "/sellers/:id")
router.get("/sellers", admin.getSellers);
router.get("/sellers/pending", admin.getPendingSellers);
router.get("/sellers/notifications-count", admin.getPendingSellerCount);
router.get("/sellers/:id", admin.getSellerDetail);
router.patch("/sellers/:id/approve", admin.approveSeller);
router.patch("/sellers/:id/reject", admin.rejectSeller);

// Buyers
router.get("/buyers", getAdminBuyers);
router.delete("/buyers/:id", deleteAdminBuyer);

// Carts & wishlist, revenue, orders & sales
router.get("/carts", admin.getCarts);
router.get("/revenue", admin.getRevenue);
router.get("/orders", admin.getOrders);

// Notifications + messages
router.get("/notifications", admin.getNotifications);
router.patch("/notifications/read-all", admin.markAllNotificationsRead);
router.patch("/notifications/:id/read", admin.markNotificationRead);
router.get("/conversations", admin.getConversations);
router.post("/conversations/:id/messages", admin.sendMessage);
router.patch("/conversations/:id/read", admin.markConversationRead);

// Field inspections
router.get("/inspectors", admin.getInspectors);
router.get("/inspections", admin.getInspections);
router.post("/inspections", admin.assignInspection);

export default router;