import express from "express";
import * as inspectionController from "../controllers/inspectionController.js";
import {
  authenticateUser,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authenticateUser,
  authorizeRoles("INSPECTOR", "ADMIN", "SUPER_ADMIN"),
  inspectionController.createInspection,
);
router.patch(
  "/:id/assign",
  authenticateUser,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  inspectionController.assignInspector,
);
router.patch(
  "/:id/report",
  authenticateUser,
  authorizeRoles("INSPECTOR", "ADMIN", "SUPER_ADMIN"),
  inspectionController.updateReport,
);
router.patch(
  "/:id/approve",
  authenticateUser,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  inspectionController.approveInspection,
);
router.patch(
  "/:id/reject",
  authenticateUser,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  inspectionController.rejectInspection,
);

export default router;
