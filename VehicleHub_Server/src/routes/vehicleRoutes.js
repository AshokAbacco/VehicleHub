import express from "express";
import * as vehicleController from "../controllers/vehicleController.js";
import {
  authenticateUser,
  requireAuth,
  authorizeRoles,
} from "../middleware/authMiddleware.js";
import { uploadFields } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Accepts "images" (multiple) + "rcFront" + "insuranceDocument" (single each) in one multipart request
const vehicleUpload = uploadFields([
  { name: "images", maxCount: 15 },
  { name: "rcFront", maxCount: 1 },
  { name: "insuranceDocument", maxCount: 1 },
]);

// Seller's own listings — must be registered before "/:id"
router.get(
  "/my/listings",
  authenticateUser,
  requireAuth,
  vehicleController.getMyListings,
);
router.delete(
  "/my/listings/:id",
  authenticateUser,
  requireAuth,
  vehicleController.deleteMyListing,
);

// Admin: vehicles waiting for approval — must be registered before "/:id"
router.get(
  "/admin/pending",
  authenticateUser,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  vehicleController.getPendingVehicles,
);

router.get("/", vehicleController.getAllVehicles);
router.get("/homepage", vehicleController.getHomepageVehicles);
router.get("/featured", vehicleController.getFeaturedVehicles);
router.get("/search", vehicleController.searchVehicle);
router.get("/filter", vehicleController.filterVehicle);
router.get("/:id", vehicleController.getVehicleById);

router.post(
  "/",
  authenticateUser,
  authorizeRoles("SELLER", "ADMIN", "SUPER_ADMIN"),
  vehicleUpload,
  vehicleController.createVehicle,
);

router.put(
  "/:id",
  authenticateUser,
  authorizeRoles("SELLER", "ADMIN", "SUPER_ADMIN"),
  vehicleUpload,
  vehicleController.updateVehicle,
);

router.delete(
  "/:id",
  authenticateUser,
  authorizeRoles("SELLER", "ADMIN", "SUPER_ADMIN"),
  vehicleController.deleteVehicle,
);

router.patch(
  "/:id/approve",
  authenticateUser,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  vehicleController.approveVehicle,
);
router.patch(
  "/:id/reject",
  authenticateUser,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  vehicleController.rejectVehicle,
);
router.patch(
  "/:id/sold",
  authenticateUser,
  authorizeRoles("SELLER", "ADMIN", "SUPER_ADMIN"),
  vehicleController.soldVehicle,
);
router.patch(
  "/:id/pending",
  authenticateUser,
  authorizeRoles("SELLER", "ADMIN", "SUPER_ADMIN"),
  vehicleController.pendingVehicle,
);

export default router;