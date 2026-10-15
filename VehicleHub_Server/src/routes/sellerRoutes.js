// VehicleHub/VehicleHub_Server/src/routes/sellerRoutes.js
// Mounted at /api/sellers.
//  - /register and /me/status: any logged-in user (a buyer applying to sell)
//  - everything else: APPROVED sellers only (admins also allowed where noted)
import { Router } from "express";
import {
  registerSeller,
  getSellerDashboard,
  getSellerStatus,
  getMyProfile,
  updateMyProfile,
  uploadMyDocuments,
  deleteMyDocument,
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
  getMySales,
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
import { requireApprovedSeller } from "../middleware/sellerAccess.js";
import { uploadFields } from "../middleware/uploadMiddleware.js";

const router = Router();
const loggedIn = [authenticateUser, requireAuth];
const seller = [authenticateUser, requireAuth, authorizeRoles("SELLER", "DEALER", "ADMIN"), requireApprovedSeller];

// ---- Seller application (buyer -> seller) ----
router.post(
  "/register",
  ...loggedIn,
  uploadFields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "shopLogo", maxCount: 1 },
    { name: "panCardImage", maxCount: 1 },
    { name: "gstCertificate", maxCount: 1 },
  ]),
  registerSeller,
);
router.get("/me/status", ...loggedIn, getSellerStatus);

// ---- Business profile (SellerProfile page) ----
router.get("/me/profile", ...seller, getMyProfile);
router.patch("/me/profile", ...seller, uploadFields([{ name: "profilePhoto", maxCount: 1 }]), updateMyProfile);
router.post("/me/documents", ...seller, uploadFields([{ name: "documents", maxCount: 10 }]), uploadMyDocuments);
router.delete("/me/documents/:documentId", ...seller, deleteMyDocument);

// ---- Seller dashboard (SellerDashboardPage) ----
router.get("/me/stats", ...seller, getMyStats);
router.get("/me/sales-performance", ...seller, getMySalesPerformance);
router.get("/me/inquiries", ...seller, getMyPendingInquiries);
router.get("/me/sales", ...seller, getMySales); // own orders + buyer payments (Payments / Invoices pages)

// ---- Notifications (bell in SellerNavbar + SellerNotificationsPage) ----
router.get("/seller-notifications", ...loggedIn, getSellerNotifications);
router.patch("/seller-notifications/read-all", ...loggedIn, markAllSellerNotificationsRead);
router.patch("/seller-notifications/:id/read", ...loggedIn, markSellerNotificationRead);
router.delete("/seller-notifications/:id", ...loggedIn, deleteSellerNotification);

// ---- Field inspections of this seller's vehicles (InspectionRequestsPage) ----
router.get("/inspection-requests", ...seller, getSellerInspections);
router.get("/inspection-requests/:id", ...seller, getSellerInspectionById);

// ---- Purchase requests buyers sent for this seller's vehicles ----
router.get("/purchase-requests", ...seller, getSellerPurchaseRequests);
router.get("/purchase-requests/:id", ...seller, getSellerPurchaseRequestById);
router.patch("/purchase-requests/:id/accept", ...seller, acceptPurchaseRequest);
router.patch("/purchase-requests/:id/reject", ...seller, rejectPurchaseRequest);

// ---- Admin ----
router.get("/:sellerId/dashboard", authenticateUser, requireAuth, authorizeRoles("ADMIN"), getSellerDashboard);

// Older path for the status check — always answers for the logged-in user
router.get("/:sellerId/seller-status", ...loggedIn, getSellerStatus);

export default router;