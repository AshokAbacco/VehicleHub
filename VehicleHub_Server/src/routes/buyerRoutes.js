// VehicleHub/VehicleHub_Server/src/routes/buyerRoutes.js
// Mounted at /api/buyer (routes/index.js). Every route needs a logged-in user.
import { Router } from "express";
import { authenticateUser, requireAuth } from "../middleware/authMiddleware.js";
import * as buyer from "../controllers/buyerController.js";

const router = Router();

router.use(authenticateUser, requireAuth);

router.get("/dashboard", buyer.getBuyerDashboard);

router.get("/wishlist", buyer.getWishlist);
router.post("/wishlist", buyer.addToWishlist);
router.delete("/wishlist/:vehicleListingId", buyer.removeFromWishlist);

router.get("/inquiries", buyer.getMyInquiries);

router.get("/profile", buyer.getProfile);
router.patch("/profile", buyer.updateProfile);

router.get("/notifications", buyer.getNotifications);
router.patch("/notifications/read-all", buyer.markAllNotificationsRead); // before "/:id/read"
router.patch("/notifications/:id/read", buyer.markNotificationRead);

router.get("/purchase-requests", buyer.getMyPurchaseRequests);
router.post("/purchase-requests", buyer.createPurchaseRequest);
router.patch("/purchase-requests/:id/cancel", buyer.cancelPurchaseRequest);

export default router;