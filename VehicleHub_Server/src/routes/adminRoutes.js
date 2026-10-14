// VehicleHub/VehicleHub_Server/src/routes/adminRoutes.js
// Mounted at /api/admin (routes/index.js). Admin / Super Admin only.
import { Router } from "express";
import { authenticateUser, authorizeRoles } from "../middleware/authMiddleware.js";
import { getAdminBuyers, deleteAdminBuyer } from "../controllers/adminBuyerController.js";

const router = Router();

router.use(authenticateUser, authorizeRoles("ADMIN", "SUPER_ADMIN"));

// Admin > Buyers page
router.get("/buyers", getAdminBuyers);
router.delete("/buyers/:id", deleteAdminBuyer);

export default router;