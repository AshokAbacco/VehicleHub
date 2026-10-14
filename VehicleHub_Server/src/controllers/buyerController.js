// VehicleHub/VehicleHub_Server/src/controllers/buyerController.js
// ============================================================
// BUYER API — mounted at /api/buyer (see routes/buyerRoutes.js)
// Response shapes match VehicleHub/src/services/buyerApiSlice.js:
//   lists  -> { success, data: [...] }   items use vehicleListingId + vehicleListing
//   notifications -> { success, data: { notifications, unreadCount } }
// ============================================================
import { prisma } from "../config/db.js";

const ok = (res, data, message = "OK", status = 200) =>
  res.status(status).json({ success: true, message, data });
const fail = (res, message, status = 400) =>
  res.status(status).json({ success: false, message });

// Vehicle fields the buyer UI shows (title, price, images, brand, model, category…)
const vehicleSelect = {
  id: true,
  title: true,
  price: true,
  images: true,
  thumbnail: true,
  brand: true,
  model: true,
  year: true,
  city: true,
  status: true,
  sellerId: true,
  vehicleType: true,
  category: { select: { name: true } },
};

const toListing = (v) =>
  v
    ? {
        ...v,
        category: v.category?.name || v.vehicleType || null,
      }
    : null;

// Purchase request -> shape used by BuyerOrdersPage / BuyerInquiriesPage / VehicleDetailPage
export const toPurchaseRequestDTO = (r) => ({
  id: r.id,
  vehicleListingId: r.vehicleId,
  vehicleListing: toListing(r.vehicle),
  buyerId: r.buyerId,
  sellerId: r.sellerId,
  offerPrice: r.offerPrice,
  buyerName: r.buyerName,
  buyerPhone: r.buyerPhone,
  buyerEmail: r.buyerEmail,
  message: r.message,
  status: r.status,
  rejectReason: r.rejectReason,
  respondedAt: r.respondedAt,
  createdAt: r.createdAt,
  updatedAt: r.updatedAt,
  ...(r.buyer ? { buyer: r.buyer } : {}),
});

// ------------------------------------------------------------
// GET /api/buyer/dashboard
// ------------------------------------------------------------
export const getBuyerDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [wishlistCount, inquiriesCount, acceptedCount, completedOrders] =
      await Promise.all([
        prisma.wishlist.count({ where: { userId } }),
        prisma.purchaseRequest.count({ where: { buyerId: userId } }),
        prisma.purchaseRequest.count({ where: { buyerId: userId, status: "ACCEPTED" } }),
        prisma.order.count({ where: { buyerId: userId, status: "COMPLETED" } }),
      ]);

    return ok(res, {
      wishlistCount,
      inquiriesCount,
      purchasedCount: Math.max(acceptedCount, completedOrders),
    });
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------------------
// WISHLIST
// GET    /api/buyer/wishlist
// POST   /api/buyer/wishlist            body: { vehicleListingId }
// DELETE /api/buyer/wishlist/:vehicleListingId
// ------------------------------------------------------------
export const getWishlist = async (req, res, next) => {
  try {
    const rows = await prisma.wishlist.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: { vehicle: { select: vehicleSelect } },
    });
    return ok(
      res,
      rows.map((w) => ({
        id: w.id,
        vehicleListingId: w.vehicleId,
        vehicleListing: toListing(w.vehicle),
        createdAt: w.createdAt,
      })),
    );
  } catch (error) {
    next(error);
  }
};

export const addToWishlist = async (req, res, next) => {
  try {
    const vehicleId = req.body?.vehicleListingId || req.body?.vehicleId;
    if (!vehicleId) return fail(res, "vehicleListingId is required");

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId }, select: { id: true } });
    if (!vehicle) return fail(res, "Vehicle not found", 404);

    const item = await prisma.wishlist.upsert({
      where: { userId_vehicleId: { userId: req.user.id, vehicleId } },
      update: {},
      create: { userId: req.user.id, vehicleId },
    });
    return ok(res, { id: item.id, vehicleListingId: vehicleId }, "Added to wishlist", 201);
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    await prisma.wishlist.deleteMany({
      where: { userId: req.user.id, vehicleId: req.params.vehicleListingId },
    });
    return ok(res, null, "Removed from wishlist");
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------------------
// GET /api/buyer/inquiries
// Inquiry.status -> the labels the buyer dashboard uses
// ------------------------------------------------------------
const INQUIRY_STATUS_LABEL = {
  PENDING: "INTERESTED",
  ACCEPTED: "PURCHASED",
  REJECTED: "LOST_INTEREST",
  CLOSED: "LOST_INTEREST",
};

export const getMyInquiries = async (req, res, next) => {
  try {
    const rows = await prisma.inquiry.findMany({
      where: { buyerId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: { vehicle: { select: vehicleSelect } },
    });
    return ok(
      res,
      rows.map((i) => ({
        id: i.id,
        vehicleListingId: i.vehicleId,
        vehicleListing: toListing(i.vehicle),
        message: i.message,
        status: INQUIRY_STATUS_LABEL[i.status] || i.status,
        createdAt: i.createdAt,
      })),
    );
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------------------
// PROFILE
// GET   /api/buyer/profile
// PATCH /api/buyer/profile     body: { fullName, phone }
// ------------------------------------------------------------
const profileSelect = {
  id: true,
  fullName: true,
  lastName: true,
  email: true,
  phone: true,
  avatar: true,
  role: true,
  createdAt: true,
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: profileSelect });
    if (!user) return fail(res, "User not found", 404);
    return ok(res, user);
  } catch (error) {
    next(error);
  }
};

const normalizePhone = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.length === 10 ? `+91${digits}` : `+${digits}`;
};

export const updateProfile = async (req, res, next) => {
  try {
    const fullName = String(req.body?.fullName ?? "").trim();
    const phoneInput = req.body?.phone;
    if (!fullName) return fail(res, "Full name is required");

    const data = { fullName };
    if (phoneInput !== undefined && String(phoneInput).trim() !== "") {
      const phone = normalizePhone(phoneInput);
      if (phone.replace(/\D/g, "").length < 10) return fail(res, "Enter a valid phone number");
      const taken = await prisma.user.findFirst({
        where: { phone, NOT: { id: req.user.id } },
        select: { id: true },
      });
      if (taken) return fail(res, "This phone number is already used by another account", 409);
      data.phone = phone;
    }

    const user = await prisma.user.update({ where: { id: req.user.id }, data, select: profileSelect });
    return ok(res, user, "Profile updated");
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------------------
// NOTIFICATIONS
// GET   /api/buyer/notifications
// PATCH /api/buyer/notifications/:id/read
// PATCH /api/buyer/notifications/read-all
// ------------------------------------------------------------
export const getNotifications = async (req, res, next) => {
  try {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.notification.count({ where: { userId: req.user.id, isRead: false } }),
    ]);
    return ok(res, { notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: { isRead: true },
    });
    return ok(res, null, "Notification marked as read");
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    const { count } = await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    return ok(res, { updated: count }, "All notifications marked as read");
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------------------
// PURCHASE REQUESTS (buyer side)
// POST  /api/buyer/purchase-requests            body from PurchaseRequestModal:
//        { vehicleListingId, offerPrice, buyerName, buyerPhone, buyerEmail, message }
// GET   /api/buyer/purchase-requests
// PATCH /api/buyer/purchase-requests/:id/cancel
// ------------------------------------------------------------
export const createPurchaseRequest = async (req, res, next) => {
  try {
    const b = req.body || {};
    const vehicleId = b.vehicleListingId || b.vehicleId;
    const offerPrice = Number(String(b.offerPrice ?? "").replace(/[^\d.]/g, ""));
    const buyerName = String(b.buyerName || "").trim();
    const buyerPhone = String(b.buyerPhone || "").trim();
    const buyerEmail = String(b.buyerEmail || "").trim() || null;
    const message = String(b.message || "").trim() || null;

    if (!vehicleId) return fail(res, "Vehicle is required");
    if (!buyerName || !buyerPhone) return fail(res, "Name and phone number are required");
    if (!offerPrice || offerPrice <= 0) return fail(res, "Enter a valid offer price");

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true, title: true, status: true, isApproved: true, sellerId: true },
    });
    if (!vehicle) return fail(res, "Vehicle not found", 404);
    if (vehicle.sellerId && vehicle.sellerId === req.user.id) {
      return fail(res, "You can't send a purchase request for your own vehicle", 400);
    }
    if (vehicle.status === "SOLD") return fail(res, "This vehicle has already been sold", 409);
    if (!vehicle.isApproved || !["AVAILABLE", "APPROVED"].includes(vehicle.status)) {
      return fail(res, "This vehicle is not open for purchase requests right now", 409);
    }

    const existing = await prisma.purchaseRequest.findFirst({
      where: { buyerId: req.user.id, vehicleId, status: { in: ["PENDING", "ACCEPTED"] } },
      select: { id: true, status: true },
    });
    if (existing) {
      return fail(
        res,
        existing.status === "ACCEPTED"
          ? "The seller has already accepted your request for this vehicle"
          : "You already have a pending request for this vehicle",
        409,
      );
    }

    const request = await prisma.$transaction(async (tx) => {
      const created = await tx.purchaseRequest.create({
        data: {
          vehicleId,
          buyerId: req.user.id,
          sellerId: vehicle.sellerId,
          offerPrice,
          buyerName,
          buyerPhone,
          buyerEmail,
          message,
        },
        include: { vehicle: { select: vehicleSelect } },
      });

      if (vehicle.sellerId) {
        await tx.notification.create({
          data: {
            userId: vehicle.sellerId,
            type: "NEW_INQUIRY",
            title: "New purchase request",
            message: `${buyerName} offered ₹${offerPrice.toLocaleString("en-IN")} for ${vehicle.title}.`,
            metadata: { purchaseRequestId: created.id, vehicleId },
          },
        });
      }

      await tx.activityLog.create({
        data: {
          userId: req.user.id,
          action: "purchase_request.created",
          entityType: "PurchaseRequest",
          entityId: created.id,
          metadata: { vehicleId, offerPrice },
        },
      });

      return created;
    });

    return ok(res, toPurchaseRequestDTO(request), "Purchase request sent to the seller", 201);
  } catch (error) {
    next(error);
  }
};

export const getMyPurchaseRequests = async (req, res, next) => {
  try {
    const rows = await prisma.purchaseRequest.findMany({
      where: { buyerId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: { vehicle: { select: vehicleSelect } },
    });
    return ok(res, rows.map(toPurchaseRequestDTO));
  } catch (error) {
    next(error);
  }
};

export const cancelPurchaseRequest = async (req, res, next) => {
  try {
    const request = await prisma.purchaseRequest.findUnique({
      where: { id: req.params.id },
      select: { id: true, buyerId: true, sellerId: true, status: true, buyerName: true, vehicle: { select: { title: true } } },
    });
    if (!request || request.buyerId !== req.user.id) return fail(res, "Purchase request not found", 404);
    if (request.status !== "PENDING") return fail(res, `Only pending requests can be cancelled (this one is ${request.status.toLowerCase()})`, 409);

    const updated = await prisma.purchaseRequest.update({
      where: { id: request.id },
      data: { status: "CANCELLED", respondedAt: new Date() },
      include: { vehicle: { select: vehicleSelect } },
    });

    if (request.sellerId) {
      await prisma.notification.create({
        data: {
          userId: request.sellerId,
          type: "SYSTEM_ALERT",
          title: "Purchase request cancelled",
          message: `${request.buyerName} cancelled their request for ${request.vehicle?.title || "your vehicle"}.`,
          metadata: { purchaseRequestId: request.id },
        },
      });
    }

    return ok(res, toPurchaseRequestDTO(updated), "Request cancelled");
  } catch (error) {
    next(error);
  }
};