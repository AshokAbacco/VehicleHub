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
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  dashboardController.adminDashboard,
);
router.get(
  "/seller",
  authenticateUser,
  authorizeRoles("SELLER", "ADMIN", "SUPER_ADMIN"),
  dashboardController.sellerDashboard,
);
router.get(
  "/buyer",
  authenticateUser,
  authorizeRoles("BUYER", "ADMIN", "SUPER_ADMIN"),
  dashboardController.buyerDashboard,
);
router.get(
  "/dealer",
  authenticateUser,
  authorizeRoles("DEALER", "ADMIN", "SUPER_ADMIN"),
  dashboardController.dealerDashboard,
);
router.get(
  "/inspector",
  authenticateUser,
  authorizeRoles("INSPECTOR", "ADMIN", "SUPER_ADMIN"),
  dashboardController.inspectorDashboard,
);
router.get(
  "/finance",
  authenticateUser,
  authorizeRoles("FINANCE", "ADMIN", "SUPER_ADMIN"),
  dashboardController.financeDashboard,
);
router.get(
  "/super-admin",
  authenticateUser,
  authorizeRoles("SUPER_ADMIN"),
  dashboardController.superAdminDashboard,
);

export default router;
