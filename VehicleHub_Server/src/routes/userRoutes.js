import express from "express";
import * as userController from "../controllers/userController.js";
import {
  authenticateUser,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/",
  authenticateUser,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  userController.getAllUsers,
);
router.get("/:id", authenticateUser, userController.getUserById);
router.put(
  "/:id",
  authenticateUser,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  userController.updateUser,
);
router.delete(
  "/:id",
  authenticateUser,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  userController.deleteUser,
);
router.put("/profile", authenticateUser, userController.updateProfile);
router.post(
  "/profile-picture",
  authenticateUser,
  userController.uploadProfilePicture,
);
router.patch(
  "/:id/block",
  authenticateUser,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  userController.blockUser,
);
router.patch(
  "/:id/activate",
  authenticateUser,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  userController.activateUser,
);

export default router;
