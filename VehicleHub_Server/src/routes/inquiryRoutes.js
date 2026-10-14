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
  authorizeRoles("SELLER", "ADMIN", "SUPER_ADMIN"),
  inquiryController.acceptInquiry,
);
router.patch(
  "/:id/reject",
  authenticateUser,
  authorizeRoles("SELLER", "ADMIN", "SUPER_ADMIN"),
  inquiryController.rejectInquiry,
);
router.patch(
  "/:id/close",
  authenticateUser,
  authorizeRoles("SELLER", "ADMIN", "SUPER_ADMIN"),
  inquiryController.closeInquiry,
);

export default router;
