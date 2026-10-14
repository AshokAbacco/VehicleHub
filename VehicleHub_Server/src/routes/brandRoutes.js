import express from "express";
import * as brandController from "../controllers/brandController.js";
import {
  authenticateUser,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", brandController.getBrands);
router.post(
  "/",
  authenticateUser,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  brandController.createBrand,
);
router.put(
  "/:id",
  authenticateUser,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  brandController.updateBrand,
);
router.delete(
  "/:id",
  authenticateUser,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  brandController.deleteBrand,
);

export default router;
