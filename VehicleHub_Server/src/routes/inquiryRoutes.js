// VehicleHub/VehicleHub_Server/src/routes/inquiryRoutes.js
import express from "express";
import * as inquiryController from "../controllers/inquiryController.js";
import {
  authenticateUser,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateUser, inquiryController.createInquiry);
router.get("/mine", authenticateUser, inquiryController.getMyInquiries);
router.patch(
  "/:id/accept",
  authenticateUser,
  authorizeRoles("SELLER", "DEALER", "ADMIN"),
  inquiryController.acceptInquiry,
);
router.patch(
  "/:id/reject",
  authenticateUser,
  authorizeRoles("SELLER", "DEALER", "ADMIN"),
  inquiryController.rejectInquiry,
);
router.patch(
  "/:id/close",
  authenticateUser,
  authorizeRoles("SELLER", "DEALER", "ADMIN"),
  inquiryController.closeInquiry,
);

export default router;