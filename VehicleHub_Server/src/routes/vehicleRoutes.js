// VehicleHub/VehicleHub_Server/src/routes/vehicleRoutes.js
import express from "express";
import * as vehicleController from "../controllers/vehicleController.js";
import {
  authenticateUser,
  requireAuth,
  authorizeRoles,
} from "../middleware/authMiddleware.js";
import { requireApprovedSeller } from "../middleware/sellerAccess.js";
import { uploadFields } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Accepts "images" (multiple) + "rcFront" + "insuranceDocument" (single each)
// + extra "documents" (edit form) in one multipart request
const vehicleUpload = uploadFields([
  { name: "images", maxCount: 15 },
  { name: "rcFront", maxCount: 1 },
  { name: "insuranceDocument", maxCount: 1 },
  { name: "documents", maxCount: 10 },
]);

// Only approved sellers (and admins) can add or manage listings.
// Ownership of a specific vehicle is checked inside the controller.
const sellerOrAdmin = [authenticateUser, requireAuth, authorizeRoles("SELLER", "DEALER", "ADMIN"), requireApprovedSeller];

// Seller's own listings — must be registered before "/:id"
router.get("/my/listings", ...sellerOrAdmin, vehicleController.getMyListings);
router.delete("/my/listings/:id", ...sellerOrAdmin, vehicleController.deleteMyListing);

// Admin: vehicles waiting for approval — must be registered before "/:id"
router.get(
  "/admin/pending",
  authenticateUser,
  authorizeRoles("ADMIN"),
  vehicleController.getPendingVehicles,
);

// Public
router.get("/", vehicleController.getAllVehicles);
router.get("/homepage", vehicleController.getHomepageVehicles);
router.get("/featured", vehicleController.getFeaturedVehicles);
router.get("/search", vehicleController.searchVehicle);
router.get("/filter", vehicleController.filterVehicle);
router.get("/:id", vehicleController.getVehicleById);

// Seller (own vehicles) / Admin (any vehicle)
router.post("/", ...sellerOrAdmin, vehicleUpload, vehicleController.createVehicle);
router.put("/:id", ...sellerOrAdmin, vehicleUpload, vehicleController.updateVehicle);
router.delete("/:id/images", ...sellerOrAdmin, vehicleController.deleteVehicleImage);
router.delete("/:id", ...sellerOrAdmin, vehicleController.deleteVehicle);
router.patch("/:id/sold", ...sellerOrAdmin, vehicleController.soldVehicle);
router.patch("/:id/pending", ...sellerOrAdmin, vehicleController.pendingVehicle);

// Admin approvals
router.patch(
  "/:id/approve",
  authenticateUser,
  authorizeRoles("ADMIN"),
  vehicleController.approveVehicle,
);
router.patch(
  "/:id/reject",
  authenticateUser,
  authorizeRoles("ADMIN"),
  vehicleController.rejectVehicle,
);

export default router;