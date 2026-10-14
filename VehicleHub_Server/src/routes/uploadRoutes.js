import express from "express";
import * as uploadController from "../controllers/uploadController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { uploadArray } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/vehicle-images",
  authenticateUser,
  uploadArray("images", 10),
  uploadController.uploadVehicleImages,
);
router.post("/documents", authenticateUser, uploadController.uploadDocuments);
router.delete("/files", authenticateUser, uploadController.deleteFiles);

export default router;
