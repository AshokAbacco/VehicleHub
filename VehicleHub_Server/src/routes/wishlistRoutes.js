import express from "express";
import * as wishlistController from "../controllers/wishlistController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateUser, wishlistController.getWishlist);
router.post("/:vehicleId", authenticateUser, wishlistController.addWishlist);
router.delete(
  "/:vehicleId",
  authenticateUser,
  wishlistController.removeWishlist,
);

export default router;
