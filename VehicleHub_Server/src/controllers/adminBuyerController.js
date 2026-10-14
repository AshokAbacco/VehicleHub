// VehicleHub/VehicleHub_Server/src/controllers/adminBuyerController.js
// ============================================================
// ADMIN > Buyers page — mounted in routes/adminRoutes.js
//   GET    /api/admin/buyers          -> { success, data: { buyers, total } }
//   DELETE /api/admin/buyers/:id      -> deactivates the account (soft delete)
//
// Each buyer is returned in the shape BuyersPage + BuyerDetailModal already use:
//   { id, name, email, phone, joined, purchases[], pending[], wishlist[] }
// ============================================================
import { prisma } from "../config/db.js";

const monthYear = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "";
const dayMonthYear = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

const vehicleWithSeller = {
  select: {
    id: true,
    title: true,
    seller: { select: { fullName: true, sellerProfile: { select: { businessName: true } } } },
  },
};
const sellerName = (vehicle) =>
  vehicle?.seller?.sellerProfile?.businessName || vehicle?.seller?.fullName || "Seller";

const toAdminBuyer = (u) => {
  // Purchases = accepted purchase requests + completed orders
  const purchases = [
    ...u.purchaseRequestsSent
      .filter((r) => r.status === "ACCEPTED")
      .map((r) => ({
        vehicle: r.vehicle?.title || "Vehicle",
        seller: sellerName(r.vehicle),
        amount: r.offerPrice,
        date: dayMonthYear(r.respondedAt || r.updatedAt),
        source: "purchase_request",
      })),
    ...u.ordersAsBuyer
      .filter((o) => o.status === "COMPLETED")
      .map((o) => ({
        vehicle: o.vehicle?.title || "Vehicle",
        seller: sellerName(o.vehicle),
        amount: o.amount,
        date: dayMonthYear(o.completedAt || o.updatedAt),
        source: "order",
      })),
  ];

  // Pending = open purchase requests + orders not finished yet
  const pending = [
    ...u.purchaseRequestsSent
      .filter((r) => r.status === "PENDING")
      .map((r) => ({ vehicle: r.vehicle?.title || "Vehicle", seller: sellerName(r.vehicle), status: "Purchase request pending" })),
    ...u.ordersAsBuyer
      .filter((o) => ["PENDING", "CONFIRMED"].includes(o.status))
      .map((o) => ({ vehicle: o.vehicle?.title || "Vehicle", seller: sellerName(o.vehicle), status: `Order ${o.status.toLowerCase()}` })),
  ];

  return {
    id: u.id,
    name: [u.fullName, u.lastName && !String(u.fullName || "").includes(u.lastName) ? u.lastName : ""]
      .filter(Boolean)
      .join(" ") || "Unnamed buyer",
    email: u.email,
    phone: u.phone || "",
    joined: monthYear(u.createdAt),
    createdAt: u.createdAt,
    isVerified: u.isVerified,
    isBlocked: u.isBlocked,
    purchases,
    pending,
    wishlist: u.wishlist.map((w) => w.vehicle?.title).filter(Boolean),
  };
};

export const getAdminBuyers = async (req, res, next) => {
  try {
    const search = String(req.query.search || "").trim();
    const where = {
      role: "BUYER",
      isActive: true,
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { phone: { contains: search } },
            ],
          }
        : {}),
    };

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullName: true,
        lastName: true,
        email: true,
        phone: true,
        createdAt: true,
        isVerified: true,
        isBlocked: true,
        wishlist: { select: { vehicle: { select: { title: true } } } },
        purchaseRequestsSent: {
          orderBy: { createdAt: "desc" },
          select: {
            status: true,
            offerPrice: true,
            respondedAt: true,
            updatedAt: true,
            vehicle: vehicleWithSeller,
          },
        },
        ordersAsBuyer: {
          orderBy: { createdAt: "desc" },
          select: {
            status: true,
            amount: true,
            completedAt: true,
            updatedAt: true,
            vehicle: vehicleWithSeller,
          },
        },
      },
    });

    const buyers = users.map(toAdminBuyer);
    return res.json({ success: true, message: "Buyers fetched", data: { buyers, total: buyers.length } });
  } catch (error) {
    next(error);
  }
};

// Soft delete: a buyer has orders, payments, inquiries etc. linked to them, so the row
// is kept and the account is deactivated instead. authenticateUser rejects inactive
// users, so they can no longer log in, and they disappear from this list.
export const deleteAdminBuyer = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, role: true, fullName: true, email: true },
    });
    if (!user || user.role !== "BUYER") {
      return res.status(404).json({ success: false, message: "Buyer not found" });
    }

    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { isActive: false } }),
      prisma.authSession.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
      prisma.activityLog.create({
        data: {
          userId: req.user?.id || null,
          action: "buyer.deactivated",
          entityType: "User",
          entityId: user.id,
          metadata: { name: user.fullName, email: user.email },
        },
      }),
    ]);

    return res.json({ success: true, message: "Buyer removed", data: { id: user.id } });
  } catch (error) {
    next(error);
  }
};