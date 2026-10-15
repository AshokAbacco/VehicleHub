// VehicleHub/VehicleHub_Server/src/middleware/sellerAccess.js
import { prisma } from "../config/db.js";
import { isSellingRole } from "../utils/sellerAccount.js";

/**
 * Seller / Dealer areas need an APPROVED seller profile.
 * A user becomes a SELLER or DEALER only when an admin approves their application,
 * so this mainly protects older accounts that were switched before approval.
 * Admins pass through.
 */
export const requireApprovedSeller = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Authentication required" });
    if (req.user.role === "ADMIN") return next();
    if (!isSellingRole(req.user.role)) {
      return res.status(403).json({ success: false, message: "Only approved sellers and dealers can do this." });
    }
    const profile = await prisma.sellerProfile.findUnique({
      where: { userId: req.user.id },
      select: { verificationStatus: true },
    });
    if (profile?.verificationStatus !== "APPROVED") {
      return res.status(403).json({
        success: false,
        code: "SELLER_NOT_APPROVED",
        message: "Your seller account is waiting for admin approval.",
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};