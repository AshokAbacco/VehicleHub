// VehicleHub/VehicleHub_Server/src/routes/dashboardRoutes.js
import express from "express";
import * as dashboardController from "../controllers/dashboardController.js";
import {
  authenticateUser,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/admin",
  authenticateUser,
  authorizeRoles("ADMIN"),
  dashboardController.adminDashboard,
);
router.get(
  "/seller",
  authenticateUser,
  authorizeRoles("SELLER", "DEALER", "ADMIN"),
  dashboardController.sellerDashboard,
);
router.get(
  "/buyer",
  authenticateUser,
  authorizeRoles("BUYER", "ADMIN"),
  dashboardController.buyerDashboard,
);
router.get(
  "/inspector",
  authenticateUser,
  authorizeRoles("INSPECTOR", "ADMIN"),
  dashboardController.inspectorDashboard,
);

export default router;