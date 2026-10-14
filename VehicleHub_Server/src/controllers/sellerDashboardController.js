// VehicleHub/VehicleHub_Server/src/controllers/sellerDashboardController.js
// ============================================================
// SELLER DASHBOARD + SELLER NOTIFICATIONS — mounted in routes/sellerRoutes.js
//   GET    /api/sellers/me/stats               -> { success, stats }
//   GET    /api/sellers/me/sales-performance   -> { success, data: [{ label, sales, revenue }] }  (last 8 weeks)
//   GET    /api/sellers/me/inquiries           -> { success, inquiries: [...] }  (pending purchase requests)
//   GET    /api/sellers/seller-notifications            -> { success, data: { notifications, unreadCount } }
//   PATCH  /api/sellers/seller-notifications/read-all
//   PATCH  /api/sellers/seller-notifications/:id/read
//   DELETE /api/sellers/seller-notifications/:id
// Shapes match VehicleHub/src/pages/dashboard/SellerDashboardPage.jsx and its components.
// ============================================================
import { prisma } from "../config/db.js";

const fail = (res, message, status = 400) => res.status(status).json({ success: false, message });

// ------------------------------------------------------------
// GET /api/sellers/me/stats
// ------------------------------------------------------------
export const getMyStats = async (req, res, next) => {
  try {
    const sellerId = req.user.id;

    const [byStatus, liveCount, pendingInquiries, soldAgg, soldNoPrice] = await Promise.all([
      prisma.vehicle.groupBy({ by: ["status"], where: { sellerId }, _count: { _all: true } }),
      prisma.vehicle.count({ where: { sellerId, isApproved: true, status: { in: ["AVAILABLE", "APPROVED"] } } }),
      prisma.purchaseRequest.count({ where: { sellerId, status: "PENDING" } }),
      prisma.vehicle.aggregate({ where: { sellerId, status: "SOLD", soldPrice: { not: null } }, _sum: { soldPrice: true } }),
      // sold vehicles without a recorded sale price count at their listed price
      prisma.vehicle.aggregate({ where: { sellerId, status: "SOLD", soldPrice: null }, _sum: { price: true } }),
    ]);

    const count = (status) => byStatus.find((row) => row.status === status)?._count._all ?? 0;
    const total = byStatus.reduce((sum, row) => sum + row._count._all, 0);

    return res.json({
      success: true,
      stats: {
        total,
        approved: liveCount, // live on the site
        pending: count("PENDING"),
        sold: count("SOLD"),
        rejected: count("REJECTED"),
        draft: count("DRAFT"),
        archived: count("ARCHIVED"),
        pendingInquiries,
        totalRevenue: (soldAgg._sum.soldPrice || 0) + (soldNoPrice._sum.price || 0),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------------------
// GET /api/sellers/me/sales-performance   — vehicles sold per week, last 8 weeks
// ------------------------------------------------------------
const WEEKS = 8;
const DAY = 24 * 60 * 60 * 1000;

export const getMySalesPerformance = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const start = new Date(today.getTime() - WEEKS * 7 * DAY + 1);

    const sold = await prisma.vehicle.findMany({
      where: { sellerId: req.user.id, status: "SOLD", soldAt: { gte: start, lte: today } },
      select: { soldAt: true, soldPrice: true, price: true },
    });

    const buckets = Array.from({ length: WEEKS }, (_, i) => {
      const from = new Date(start.getTime() + i * 7 * DAY);
      const to = new Date(from.getTime() + 7 * DAY - 1);
      return {
        label: from.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        from: from.toISOString(),
        to: to.toISOString(),
        sales: 0,
        revenue: 0,
      };
    });

    for (const v of sold) {
      const index = Math.min(WEEKS - 1, Math.floor((new Date(v.soldAt).getTime() - start.getTime()) / (7 * DAY)));
      if (index < 0) continue;
      buckets[index].sales += 1;
      buckets[index].revenue += v.soldPrice ?? v.price ?? 0;
    }

    return res.json({ success: true, data: buckets });
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------------------
// GET /api/sellers/me/inquiries   — open purchase requests on my vehicles
// ------------------------------------------------------------
export const getMyPendingInquiries = async (req, res, next) => {
  try {
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 6));
    const rows = await prisma.purchaseRequest.findMany({
      where: { sellerId: req.user.id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        buyerName: true,
        buyerPhone: true,
        offerPrice: true,
        message: true,
        status: true,
        createdAt: true,
        vehicle: { select: { id: true, title: true, price: true, images: true } },
      },
    });

    const inquiries = rows.map(({ vehicle, ...r }) => ({
      ...r,
      vehicleListingId: vehicle?.id,
      vehicleListing: vehicle,
    }));
    return res.json({ success: true, inquiries, total: inquiries.length });
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------------------
// SELLER NOTIFICATIONS (bell in SellerNavbar + SellerNotificationsPage)
// ------------------------------------------------------------
// Where a notification should take the seller when clicked
const linkFor = (n) => {
  const meta = n.metadata || {};
  if (meta.purchaseRequestId) return "/seller/dashboard/purchase-requests";
  if (["VEHICLE_APPROVED", "VEHICLE_REJECTED", "SALE_COMPLETED"].includes(n.type)) return "/seller/dashboard/inventory";
  if (n.type === "NEW_INQUIRY") return "/seller/dashboard/purchase-requests";
  return null;
};

export const getSellerNotifications = async (req, res, next) => {
  try {
    const [rows, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.notification.count({ where: { userId: req.user.id, isRead: false } }),
    ]);
    const notifications = rows.map((n) => ({ ...n, read: n.isRead, link: linkFor(n) }));
    return res.json({ success: true, data: { notifications, unreadCount } });
  } catch (error) {
    next(error);
  }
};

export const markSellerNotificationRead = async (req, res, next) => {
  try {
    const { count } = await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: { isRead: true },
    });
    if (!count) return fail(res, "Notification not found", 404);
    return res.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    next(error);
  }
};

export const markAllSellerNotificationsRead = async (req, res, next) => {
  try {
    const { count } = await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    return res.json({ success: true, message: "All notifications marked as read", data: { updated: count } });
  } catch (error) {
    next(error);
  }
};

export const deleteSellerNotification = async (req, res, next) => {
  try {
    const { count } = await prisma.notification.deleteMany({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!count) return fail(res, "Notification not found", 404);
    return res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    next(error);
  }
};