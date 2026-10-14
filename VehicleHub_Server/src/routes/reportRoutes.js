import express from "express";
import * as reportController from "../controllers/reportController.js";
import {
  authenticateUser,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/sales",
  authenticateUser,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  reportController.salesReport,
);
router.get(
  "/revenue",
  authenticateUser,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  reportController.revenueReport,
);
router.get(
  "/vehicles",
  authenticateUser,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  reportController.vehicleReport,
);
router.get(
  "/users",
  authenticateUser,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  reportController.userReport,
);
router.get(
  "/inspections",
  authenticateUser,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  reportController.inspectionReport,
);

export default router;
