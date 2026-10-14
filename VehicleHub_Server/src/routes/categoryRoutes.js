import express from "express";
import * as categoryController from "../controllers/categoryController.js";
import {
  authenticateUser,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", categoryController.getCategories);
router.post(
  "/",
  authenticateUser,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  categoryController.createCategory,
);
router.put(
  "/:id",
  authenticateUser,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  categoryController.updateCategory,
);
router.delete(
  "/:id",
  authenticateUser,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  categoryController.deleteCategory,
);

export default router;
