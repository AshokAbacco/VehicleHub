// VehicleHub/VehicleHub_Server/src/utils/sellerAccount.js
// ============================================================
// Seller vs Dealer — the two selling roles.
//
//   SELLER  an individual selling one vehicle. Only ONE open listing at a time
//           (draft, pending, live or rejected). Once it is sold or archived they can list another.
//   DEALER  a business / shop selling many vehicles. No listing limit; listings carry the shop name.
//
// Both apply through POST /api/sellers/register (sellerType "Individual" or "Dealer") and stay
// BUYER until an admin approves — approval gives SELLER or DEALER based on the application.
// Every record is scoped to the signed-in account (vehicle.sellerId = user.id), so sellers and
// dealers only ever see their own vehicles, requests, orders and payments.
// ============================================================
import { prisma } from "../config/db.js";

export const SELLING_ROLES = ["SELLER", "DEALER"];
export const isSellingRole = (role) => SELLING_ROLES.includes(role);

// Application type -> login role given on approval
export const roleForSellerType = (sellerType) => (sellerType === "DEALER" ? "DEALER" : "SELLER");

export const SELLER_LISTING_LIMIT = 1;
// Listings that count against an individual seller's limit (everything except finished ones)
export const OPEN_LISTING_STATUSES = ["DRAFT", "PENDING", "APPROVED", "AVAILABLE", "REJECTED"];

export const accountTypeLabel = (role) => (role === "DEALER" ? "Dealer" : role === "SELLER" ? "Seller" : null);

/**
 * How many more listings this account may add.
 * -> { limit: number|null, open: number, remaining: number|null, canAdd: boolean }
 * limit/remaining are null for dealers and admins (unlimited).
 */
export const listingAllowance = async (user) => {
  if (user?.role !== "SELLER") return { limit: null, open: null, remaining: null, canAdd: true };
  const open = await prisma.vehicle.count({ where: { sellerId: user.id, status: { in: OPEN_LISTING_STATUSES } } });
  const remaining = Math.max(0, SELLER_LISTING_LIMIT - open);
  return { limit: SELLER_LISTING_LIMIT, open, remaining, canAdd: remaining > 0 };
};

export const SELLER_LIMIT_MESSAGE =
  "Seller accounts can list one vehicle at a time. Edit your current listing, or mark it as sold before adding another. Selling several vehicles? Contact VehicleHub to switch to a Dealer account.";
  