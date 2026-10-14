// VehicleHub/VehicleHub_Server/src/routes/sellerRoutes.js
import { Router } from "express";
import multer from "multer";
import {
  registerSeller,
  getSellerDashboard,
  getSellerStatus,
} from "../controllers/sellerController.js";
import {
  getSellerPurchaseRequests,
  getSellerPurchaseRequestById,
  acceptPurchaseRequest,
  rejectPurchaseRequest,
} from "../controllers/sellerPurchaseRequestController.js";
import {
  getMyStats,
  getMySalesPerformance,
  getMyPendingInquiries,
  getSellerNotifications,
  markSellerNotificationRead,
  markAllSellerNotificationsRead,
  deleteSellerNotification,
} from "../controllers/sellerDashboardController.js";
import { getSellerInspections, getSellerInspectionById } from "../controllers/sellerInspectionController.js";
import {
  authenticateUser,
  requireAuth,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = Router();
const upload = multer({ dest: "uploads/sellers/" });

router.post(
  "/register",
  authenticateUser, // attaches req.user if a valid token is present
  requireAuth, // blocks the request if req.user is still null
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "shopLogo", maxCount: 1 },
    { name: "panCardImage", maxCount: 1 },
    { name: "gstCertificate", maxCount: 1 },
  ]),
  registerSeller,
);

// Seller dashboard (SellerDashboardPage) — logged-in seller's own data
router.get("/me/stats", authenticateUser, requireAuth, getMyStats);
router.get("/me/sales-performance", authenticateUser, requireAuth, getMySalesPerformance);
router.get("/me/inquiries", authenticateUser, requireAuth, getMyPendingInquiries);

// Seller notifications (bell in SellerNavbar + SellerNotificationsPage)
router.get("/seller-notifications", authenticateUser, requireAuth, getSellerNotifications);
router.patch("/seller-notifications/read-all", authenticateUser, requireAuth, markAllSellerNotificationsRead);
router.patch("/seller-notifications/:id/read", authenticateUser, requireAuth, markSellerNotificationRead);
router.delete("/seller-notifications/:id", authenticateUser, requireAuth, deleteSellerNotification);

// Field inspections of this seller's vehicles (InspectionRequestsPage)
router.get("/inspection-requests", authenticateUser, requireAuth, getSellerInspections);
router.get("/inspection-requests/:id", authenticateUser, requireAuth, getSellerInspectionById);

// Purchase requests buyers sent for this seller's vehicles (SellerPurchaseRequestsPage)
router.get("/purchase-requests", authenticateUser, requireAuth, getSellerPurchaseRequests);
router.get("/purchase-requests/:id", authenticateUser, requireAuth, getSellerPurchaseRequestById);
router.patch("/purchase-requests/:id/accept", authenticateUser, requireAuth, acceptPurchaseRequest);
router.patch("/purchase-requests/:id/reject", authenticateUser, requireAuth, rejectPurchaseRequest);

router.get(
  "/:sellerId/dashboard",
  authenticateUser,
  requireAuth,
  authorizeRoles("ADMIN", "SUPER_ADMIN"), // note: spread args, matching this file's actual signature
  getSellerDashboard,
);

// Endpoint to get the seller's status (registered, approved, rejected)
router.get(
  "/:sellerId/seller-status",
  authenticateUser,
  requireAuth,
  getSellerStatus,
);

export default router;