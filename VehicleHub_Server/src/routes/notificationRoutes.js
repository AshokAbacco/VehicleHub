import express from "express";
import * as notificationController from "../controllers/notificationController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateUser, notificationController.getNotifications);
router.post("/", authenticateUser, notificationController.sendNotification);
router.patch(
  "/:id/read",
  authenticateUser,
  notificationController.readNotification,
);
router.delete(
  "/:id",
  authenticateUser,
  notificationController.deleteNotification,
);

export default router;
