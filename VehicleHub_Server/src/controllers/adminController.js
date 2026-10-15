// VehicleHub/VehicleHub_Server/src/controllers/adminController.js
// ============================================================
// ADMIN PANEL API — mounted at /api/admin (routes/adminRoutes.js), ADMIN role only.
// Everything here is read from the database; there is no sample data.
//
//   GET    /dashboard                      stat cards, revenue overview, pending approvals, cart activity
//   GET    /vehicles        DELETE /vehicles/:id
//   GET    /sellers          ?status=APPROVED|PENDING|REJECTED|ALL&search=
//   GET    /sellers/pending  GET /sellers/notifications-count  GET /sellers/:id
//   PATCH  /sellers/:id/approve            PATCH /sellers/:id/reject  { reason }
//   GET    /carts                          GET /revenue          GET /orders
//   GET    /notifications  PATCH /notifications/read-all  PATCH /notifications/:id/read
//   GET    /conversations  POST /conversations/:id/messages { text }
//   GET    /inspectors     GET /inspections   POST /inspections { vehicleId, inspectorId, scheduledAt, priority, deadline }
// ============================================================
import { prisma } from "../config/db.js";
import { toVehicleDTO, vehicleStage, categoryEmoji } from "../utils/vehicleDto.js";
import { inspectionInclude, toInspectionDTO, inspectionNo } from "../utils/inspectionDto.js";
import { SELLING_ROLES, roleForSellerType, accountTypeLabel } from "../utils/sellerAccount.js";

const ok = (res, data, message = "OK", status = 200) => res.status(status).json({ success: true, message, data });
const fail = (res, message, status = 400) => res.status(status).json({ success: false, message });

// Platform commission on each completed sale (used when no order records a commission)
const COMMISSION_RATE = Number(process.env.COMMISSION_RATE ?? 0.02);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dayMonthYear = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null);
const monthYear = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : null);
const timeAgo = (date) => {
  const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return dayMonthYear(date);
};

const sellerDisplayName = (u) => u?.sellerProfile?.businessName || u?.fullName || u?.sellerProfile?.ownerName || "Seller";

// ------------------------------------------------------------
// Sales = vehicles marked SOLD. The buyer is the accepted purchase request
// (or a completed order, for sales recorded as orders).
// ------------------------------------------------------------
const loadSales = async (where = {}) => {
  const vehicles = await prisma.vehicle.findMany({
    where: { status: "SOLD", ...where },
    orderBy: [{ soldAt: "desc" }, { updatedAt: "desc" }],
    include: {
      category: { select: { name: true } },
      seller: { select: { id: true, fullName: true, email: true, phone: true, sellerProfile: { select: { businessName: true, ownerName: true } } } },
      purchaseRequests: {
        where: { status: "ACCEPTED" },
        orderBy: { respondedAt: "desc" },
        take: 1,
        include: { buyer: { select: { id: true, fullName: true, email: true, phone: true } } },
      },
      orders: {
        where: { status: { in: ["COMPLETED", "CONFIRMED"] } },
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { buyer: { select: { id: true, fullName: true, email: true, phone: true } }, payments: true },
      },
    },
  });
  return vehicles.map((v) => {
    const request = v.purchaseRequests[0];
    const order = v.orders[0];
    const amount = v.soldPrice ?? order?.amount ?? request?.offerPrice ?? v.price ?? 0;
    const buyer = request?.buyer || order?.buyer || null;
    const paid = (order?.payments || []).filter((p) => p.status === "SUCCESS").reduce((s, p) => s + p.amount, 0);
    return {
      id: v.id,
      vehicleId: v.id,
      vehicle: v.title,
      category: v.category?.name || v.vehicleType || null,
      thumb: categoryEmoji(v.category?.name || v.vehicleType),
      image: v.thumbnail || v.images?.[0] || null,
      amount,
      listedPrice: v.price,
      commission: order?.commission ?? Math.round(amount * COMMISSION_RATE),
      soldAt: v.soldAt || v.updatedAt,
      buyer: buyer ? { id: buyer.id, name: buyer.fullName || request?.buyerName || "Buyer", email: buyer.email, phone: request?.buyerPhone || buyer.phone } : null,
      seller: v.seller ? { id: v.seller.id, name: sellerDisplayName(v.seller), email: v.seller.email, phone: v.seller.phone } : null,
      source: request ? "Purchase request" : order ? "Order" : "Marked sold by seller",
      orderId: order?.id || null,
      paymentStatus: order ? (paid >= amount ? "Paid" : paid > 0 ? "Part paid" : "Unpaid") : "Settled offline",
      amountPaid: paid,
    };
  });
};

const sumBy = (rows, fn) => rows.reduce((s, r) => s + (Number(fn(r)) || 0), 0);

// Revenue summary used by the dashboard card and the Revenue page
const buildRevenueSummary = async () => {
  const sales = await loadSales();
  const now = new Date();
  const inRange = (d, from, to) => d && new Date(d) >= from && new Date(d) <= to;

  const monthlyBreakdown = [];
  for (let m = 5; m >= 0; m--) {
    const from = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const to = new Date(now.getFullYear(), now.getMonth() - m + 1, 0, 23, 59, 59, 999);
    const rows = sales.filter((s) => inRange(s.soldAt, from, to));
    monthlyBreakdown.push({ month: MONTHS[from.getMonth()], label: MONTHS[from.getMonth()], revenue: sumBy(rows, (r) => r.amount), commission: sumBy(rows, (r) => r.commission), sales: rows.length });
  }
  const dailyBreakdown = [];
  for (let d = 6; d >= 0; d--) {
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d);
    const to = new Date(from.getTime() + 86399999);
    const rows = sales.filter((s) => inRange(s.soldAt, from, to));
    dailyBreakdown.push({ label: DAYS[from.getDay()], revenue: sumBy(rows, (r) => r.amount), sales: rows.length });
  }
  const weeklyBreakdown = [];
  for (let w = 3; w >= 0; w--) {
    const to = new Date(now.getFullYear(), now.getMonth(), now.getDate() - w * 7, 23, 59, 59, 999);
    const from = new Date(to.getTime() - 7 * 86400000 + 1);
    const rows = sales.filter((s) => inRange(s.soldAt, from, to));
    weeklyBreakdown.push({ label: `W${4 - w}`, revenue: sumBy(rows, (r) => r.amount), sales: rows.length });
  }

  // Share of sales value per category (%)
  const palette = ["#001f3f", "#2d6cdf", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#64748b"];
  const totalRevenue = sumBy(sales, (r) => r.amount);
  const byCategory = {};
  sales.forEach((s) => { byCategory[s.category || "Other"] = (byCategory[s.category || "Other"] || 0) + s.amount; });
  const categoryBreakdown = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], i) => ({ label, value: totalRevenue ? Math.round((value / totalRevenue) * 100) : 0, amount: value, color: palette[i % palette.length] }));

  const thisMonth = monthlyBreakdown[5].revenue;
  const lastMonth = monthlyBreakdown[4].revenue;
  const pendingPayments = await prisma.payment.aggregate({ where: { status: "PENDING" }, _sum: { amount: true } });

  return {
    totalRevenue,
    commissionEarned: sumBy(sales, (r) => r.commission),
    pendingPayouts: pendingPayments._sum.amount || 0,
    thisMonthRevenue: thisMonth,
    thisMonthCommission: monthlyBreakdown[5].commission,
    monthlyGrowth: lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 1000) / 10 : null,
    totalSales: sales.length,
    commissionRate: COMMISSION_RATE,
    monthlyBreakdown,
    weeklyBreakdown,
    dailyBreakdown,
    categoryBreakdown,
  };
};

// ------------------------------------------------------------
// Cart / wishlist activity (Wishlist table = buyer hearts, CartItem CART = carts)
// ------------------------------------------------------------
const loadCartActivity = async (take = 60) => {
  const vehicleSel = { select: { id: true, title: true, price: true } };
  const userSel = { select: { id: true, fullName: true, email: true } };
  const [wish, carts] = await Promise.all([
    prisma.wishlist.findMany({ orderBy: { createdAt: "desc" }, take, include: { vehicle: vehicleSel, user: userSel } }),
    prisma.cartItem.findMany({ where: { type: "CART" }, orderBy: { addedAt: "desc" }, take, include: { vehicle: vehicleSel, user: userSel } }),
  ]);
  return [
    ...wish.map((w) => ({ id: `w-${w.id}`, type: "Wishlist", buyerId: w.userId, buyer: w.user?.fullName || w.user?.email || "Buyer", vehicleId: w.vehicleId, vehicle: w.vehicle?.title || "Vehicle", value: w.vehicle?.price || 0, date: w.createdAt })),
    ...carts.map((c) => ({ id: `c-${c.id}`, type: "Cart", buyerId: c.userId, buyer: c.user?.fullName || c.user?.email || "Buyer", vehicleId: c.vehicleId, vehicle: c.vehicle?.title || "Vehicle", value: c.vehicle?.price || 0, date: c.addedAt })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, take)
    .map((c) => ({ ...c, addedAt: timeAgo(c.date) }));
};

// ============================================================
// DASHBOARD
// ============================================================
export const getDashboard = async (req, res, next) => {
  try {
    const [totalVehicles, pendingApprovals, activeSellers, totalBuyers, rejectedListings, pendingSellerApplications, liveVehicles, revenue, pending, cartActivity, activeDealers] = await Promise.all([
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { status: "PENDING" } }),
      // individual sellers (dealers are counted separately below)
      prisma.user.count({ where: { role: "SELLER", isActive: true, sellerProfile: { verificationStatus: "APPROVED" } } }),
      prisma.user.count({ where: { role: "BUYER", isActive: true } }),
      prisma.vehicle.count({ where: { status: "REJECTED" } }),
      prisma.sellerProfile.count({ where: { verificationStatus: "PENDING" } }),
      prisma.vehicle.count({ where: { isApproved: true, status: { in: ["AVAILABLE", "APPROVED"] } } }),
      buildRevenueSummary(),
      prisma.vehicle.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "asc" },
        take: 4,
        include: { category: { select: { name: true } }, seller: { select: { fullName: true, sellerProfile: { select: { businessName: true } } } } },
      }),
      loadCartActivity(6),
      prisma.user.count({ where: { role: "DEALER", isActive: true, sellerProfile: { verificationStatus: "APPROVED" } } }),
    ]);

    return ok(res, {
      stats: {
        totalVehicles,
        liveVehicles,
        pendingApprovals,
        activeSellers,
        activeDealers,
        pendingSellerApplications,
        totalBuyers,
        thisMonthRevenue: revenue.thisMonthRevenue,
        thisMonthCommission: revenue.thisMonthCommission,
        rejectedListings,
      },
      revenueSummary: revenue,
      pendingVehicles: pending.map((v) => ({
        id: v.id,
        title: v.title,
        thumb: categoryEmoji(v.category?.name || v.vehicleType),
        seller: sellerDisplayName(v.seller),
        submittedAt: timeAgo(v.createdAt),
      })),
      cartActivity,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// ALL VEHICLES
// ============================================================
const adminVehicleInclude = {
  category: { select: { id: true, name: true } },
  seller: { select: { id: true, fullName: true, email: true, phone: true, sellerProfile: { select: { businessName: true, ownerName: true, sellerType: true, verificationStatus: true } } } },
  purchaseRequests: { where: { status: "ACCEPTED" }, take: 1, orderBy: { respondedAt: "desc" }, include: { buyer: { select: { fullName: true } } } },
  orders: { where: { status: "COMPLETED" }, take: 1, orderBy: { createdAt: "desc" }, include: { buyer: { select: { fullName: true } } } },
};

const toAdminVehicle = (v) => {
  const { purchaseRequests, orders, ...rest } = v;
  const dto = toVehicleDTO(rest);
  const buyerName = purchaseRequests?.[0]?.buyer?.fullName || purchaseRequests?.[0]?.buyerName || orders?.[0]?.buyer?.fullName || null;
  return {
    ...dto,
    status: vehicleStage(v), // live | pending | sold | rejected | draft | archived
    dbStatus: v.status,
    thumb: categoryEmoji(dto.category),
    seller: sellerDisplayName(v.seller),
    sellerId: v.sellerId,
    sellerName: v.seller?.sellerProfile?.ownerName || v.seller?.fullName || dto.sellerName,
    sellerEmail: v.seller?.email || dto.email,
    sellerPhone: v.seller?.phone || dto.mobileNumber,
    location: [v.city, v.state].filter(Boolean).join(", ") || v.location || null,
    postedOn: dayMonthYear(v.createdAt),
    soldTo: buyerName,
    soldOn: dayMonthYear(v.soldAt),
    rejectedReason: v.rejectReason,
  };
};

export const getVehicles = async (req, res, next) => {
  try {
    const search = String(req.query.search || "").trim();
    const vehicles = await prisma.vehicle.findMany({
      where: search
        ? { OR: [
            { title: { contains: search, mode: "insensitive" } },
            { brand: { contains: search, mode: "insensitive" } },
            { registrationNumber: { contains: search, mode: "insensitive" } },
          ] }
        : {},
      orderBy: { createdAt: "desc" },
      include: adminVehicleInclude,
    });
    const rows = vehicles.map(toAdminVehicle);
    return ok(res, { vehicles: rows, total: rows.length });
  } catch (error) {
    next(error);
  }
};

// Delete when nothing references the vehicle; otherwise archive it (kept for order/payment history)
export const deleteVehicle = async (req, res, next) => {
  try {
    const v = await prisma.vehicle.findUnique({ where: { id: req.params.id }, select: { id: true, title: true, status: true, sellerId: true } });
    if (!v) return fail(res, "Vehicle not found", 404);
    let archived = false;
    try {
      await prisma.$transaction([
        prisma.wishlist.deleteMany({ where: { vehicleId: v.id } }),
        prisma.cartItem.deleteMany({ where: { vehicleId: v.id } }),
        prisma.vehicle.delete({ where: { id: v.id } }),
      ]);
    } catch (err) {
      if (err?.code !== "P2003") throw err;
      archived = true;
      await prisma.vehicle.update({ where: { id: v.id }, data: { status: "ARCHIVED", isApproved: false } });
      await prisma.vehicleStatusHistory.create({ data: { vehicleId: v.id, fromStatus: v.status, toStatus: "ARCHIVED", reason: "Removed by admin", changedById: req.user.id } });
    }
    await prisma.activityLog.create({ data: { userId: req.user.id, action: archived ? "vehicle.archived" : "vehicle.deleted", entityType: "Vehicle", entityId: v.id, metadata: { title: v.title } } });
    return ok(res, { id: v.id, archived }, archived ? "Vehicle has orders or inspections linked to it, so it was archived instead of deleted" : "Vehicle deleted");
  } catch (error) {
    next(error);
  }
};

// ============================================================
// SELLERS (applications + approved sellers)
// ============================================================
const sellerUserSelect = {
  id: true, fullName: true, email: true, phone: true, role: true, isActive: true, createdAt: true,
  sellerProfile: { include: { documents: { orderBy: { uploadedAt: "desc" } } } },
  vehicles: { select: { id: true, status: true, isApproved: true, price: true, soldPrice: true } },
};

const docUrl = (profile, type) => profile?.documents?.find((d) => d.type === type)?.fileUrl || null;

const toAdminSeller = (u) => {
  const p = u.sellerProfile;
  const vehicles = u.vehicles || [];
  const sold = vehicles.filter((v) => v.status === "SOLD");
  const statusLabel = { APPROVED: "Active", PENDING: "Pending", REJECTED: "Rejected", SUSPENDED: "Suspended" }[p?.verificationStatus] || "—";
  return {
    id: u.id, // user id (used by every admin seller endpoint)
    userId: u.id,
    profileId: p?.id,
    name: p?.businessName || p?.ownerName || u.fullName || "Seller",
    ownerName: p?.ownerName || u.fullName,
    businessName: p?.businessName || null,
    email: u.email,
    phone: u.phone || "",
    type: p?.sellerType === "DEALER" ? "Dealer" : "Individual",
    sellerType: p?.sellerType === "DEALER" ? "Dealer" : "Individual",
    // login role once approved: "Seller" (individual, one vehicle) or "Dealer" (shop, many vehicles)
    accountType: accountTypeLabel(u.role) || (p?.sellerType === "DEALER" ? "Dealer" : "Seller"),
    role: u.role,
    joined: monthYear(p?.reviewedAt || p?.submittedAt || u.createdAt),
    verified: p?.verificationStatus === "APPROVED",
    verificationStatus: p?.verificationStatus || null,
    status: statusLabel,
    isActive: u.isActive,
    listings: vehicles.length,
    liveListings: vehicles.filter((v) => v.isApproved && ["AVAILABLE", "APPROVED"].includes(v.status)).length,
    soldCount: sold.length,
    revenue: sumBy(sold, (v) => v.soldPrice ?? v.price),
    // application details (SellerVerificationModal / SellerReviewModal)
    address: p?.address, city: p?.city, state: p?.state, pincode: p?.pincode,
    gstNumber: p?.gstNumber, panNumber: p?.panNumber, yearsInBusiness: p?.yearsInBusiness, website: p?.website,
    bankAccountHolder: p?.bankAccountHolder, bankAccountNumber: p?.bankAccountNumber, bankIFSC: p?.bankIFSC, bankName: p?.bankName,
    description: p?.description,
    profilePhoto: p?.profilePhoto || null,
    shopLogo: p?.shopLogo || null,
    panCardImage: docUrl(p, "PAN_CARD"),
    gstCertificate: docUrl(p, "GST_CERTIFICATE"),
    documents: (p?.documents || []).map((d) => ({ id: d.id, type: d.type, fileUrl: d.fileUrl, status: d.status })),
    rejectReason: p?.rejectReason || null,
    submittedAt: p?.submittedAt,
    reviewedAt: p?.reviewedAt,
  };
};

const SELLER_STATUSES = ["APPROVED", "PENDING", "REJECTED", "SUSPENDED"];

export const getSellers = async (req, res, next) => {
  try {
    const status = String(req.query.status || "APPROVED").toUpperCase();
    const search = String(req.query.search || "").trim();
    // ?type=SELLER (individuals) | DEALER (shops) — by application type, so pending applications filter too
    const type = String(req.query.type || "").toUpperCase();
    const typeFilter = type === "DEALER" ? { sellerType: "DEALER" } : type === "SELLER" ? { sellerType: "INDIVIDUAL" } : {};
    const users = await prisma.user.findMany({
      where: {
        sellerProfile: SELLER_STATUSES.includes(status) ? { verificationStatus: status, ...typeFilter } : (type ? typeFilter : { isNot: null }),
        ...(search ? { OR: [
          { fullName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { sellerProfile: { businessName: { contains: search, mode: "insensitive" } } },
        ] } : {}),
      },
      orderBy: { createdAt: "desc" },
      select: sellerUserSelect,
    });
    const sellers = users.map(toAdminSeller).sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));
    const counts = await prisma.sellerProfile.groupBy({ by: ["verificationStatus"], where: typeFilter, _count: { _all: true } });
    const countOf = (s) => counts.find((c) => c.verificationStatus === s)?._count._all || 0;
    return res.json({
      success: true,
      data: { sellers, total: sellers.length, counts: { APPROVED: countOf("APPROVED"), PENDING: countOf("PENDING"), REJECTED: countOf("REJECTED"), SUSPENDED: countOf("SUSPENDED") } },
      sellers, // AdminNotificationsModal reads data.sellers
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingSellers = (req, res, next) => {
  req.query.status = "PENDING";
  return getSellers(req, res, next);
};

export const getPendingSellerCount = async (req, res, next) => {
  try {
    const count = await prisma.sellerProfile.count({ where: { verificationStatus: "PENDING" } });
    return res.json({ success: true, count });
  } catch (error) {
    next(error);
  }
};

// :id may be the user id or the seller-profile id
const findSellerUser = async (id) =>
  prisma.user.findFirst({ where: { OR: [{ id }, { sellerProfile: { id } }], sellerProfile: { isNot: null } }, select: sellerUserSelect });

export const getSellerDetail = async (req, res, next) => {
  try {
    const user = await findSellerUser(req.params.id);
    if (!user) return fail(res, "Seller not found", 404);
    const vehicles = await prisma.vehicle.findMany({ where: { sellerId: user.id }, orderBy: { createdAt: "desc" }, include: adminVehicleInclude });
    const seller = { ...toAdminSeller(user), vehicles: vehicles.map(toAdminVehicle) };
    return res.json({ success: true, seller, data: seller });
  } catch (error) {
    next(error);
  }
};

export const approveSeller = async (req, res, next) => {
  try {
    const user = await findSellerUser(req.params.id);
    if (!user) return fail(res, "Seller not found", 404);
    if (!["BUYER", ...SELLING_ROLES].includes(user.role)) return fail(res, "Admin and field inspector accounts can't be made sellers", 409);
    // Individual application -> SELLER (one vehicle); dealer application -> DEALER (shop, many vehicles)
    const newRole = roleForSellerType(user.sellerProfile.sellerType);
    const label = newRole === "DEALER" ? "Dealer" : "Seller";
    if (user.sellerProfile.verificationStatus === "APPROVED" && user.role === newRole) return fail(res, `This ${label.toLowerCase()} is already approved`, 409);
    const now = new Date();
    await prisma.$transaction([
      prisma.sellerProfile.update({
        where: { id: user.sellerProfile.id },
        data: { verificationStatus: "APPROVED", isApproved: true, rejectReason: null, reviewedAt: now, reviewedBy: req.user.id },
      }),
      prisma.sellerDocument.updateMany({ where: { sellerProfileId: user.sellerProfile.id, status: "PENDING" }, data: { status: "VERIFIED", verifiedAt: now } }),
      prisma.user.update({ where: { id: user.id }, data: { role: newRole } }),
      prisma.notification.create({
        data: {
          userId: user.id,
          type: "SELLER_APPROVED",
          title: `${label} account approved`,
          message: newRole === "DEALER"
            ? "Your dealer registration has been approved. You can now add and manage your shop's vehicles from your dealer dashboard."
            : "Your seller registration has been approved. You can now list your vehicle from your seller dashboard.",
          metadata: { sellerProfileId: user.sellerProfile.id },
        },
      }),
      prisma.activityLog.create({ data: { userId: req.user.id, action: "seller.approved", entityType: "SellerProfile", entityId: user.sellerProfile.id, metadata: { sellerUserId: user.id, role: newRole } } }),
    ]);
    return ok(res, { id: user.id, role: newRole }, `${label} approved`);
  } catch (error) {
    next(error);
  }
};

export const rejectSeller = async (req, res, next) => {
  try {
    const reason = String(req.body?.reason || "").trim();
    if (!reason) return fail(res, "A rejection reason is required");
    const user = await findSellerUser(req.params.id);
    if (!user) return fail(res, "Seller not found", 404);
    if (user.sellerProfile.verificationStatus !== "PENDING") {
      return fail(res, `Only pending applications can be rejected (this one is ${user.sellerProfile.verificationStatus.toLowerCase()})`, 409);
    }
    const now = new Date();
    await prisma.$transaction([
      prisma.sellerProfile.update({
        where: { id: user.sellerProfile.id },
        data: { verificationStatus: "REJECTED", isApproved: false, rejectReason: reason, reviewedAt: now, reviewedBy: req.user.id },
      }),
      // Applicants stay buyers until approved
      ...(SELLING_ROLES.includes(user.role) ? [prisma.user.update({ where: { id: user.id }, data: { role: "BUYER" } })] : []),
      prisma.notification.create({
        data: {
          userId: user.id,
          type: "SELLER_REJECTED",
          title: "Seller registration rejected",
          message: `Your seller registration was rejected. Reason: ${reason}. You can correct the details and apply again.`,
          metadata: { sellerProfileId: user.sellerProfile.id, reason },
        },
      }),
      prisma.activityLog.create({ data: { userId: req.user.id, action: "seller.rejected", entityType: "SellerProfile", entityId: user.sellerProfile.id, metadata: { sellerUserId: user.id, reason } } }),
    ]);
    return ok(res, { id: user.id }, "Seller rejected");
  } catch (error) {
    next(error);
  }
};

// ============================================================
// CARTS, REVENUE, ORDERS
// ============================================================
export const getCarts = async (req, res, next) => {
  try {
    const activity = await loadCartActivity(60);
    return ok(res, {
      activity,
      cartCount: await prisma.cartItem.count({ where: { type: "CART" } }),
      wishlistCount: await prisma.wishlist.count(),
    });
  } catch (error) {
    next(error);
  }
};

export const getRevenue = async (req, res, next) => {
  try {
    return ok(res, await buildRevenueSummary());
  } catch (error) {
    next(error);
  }
};

// Orders & Sales page: completed sales, every purchase request, and payment records
export const getOrders = async (req, res, next) => {
  try {
    const [sales, requests, payments] = await Promise.all([
      loadSales(),
      prisma.purchaseRequest.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
        include: {
          vehicle: { select: { id: true, title: true, price: true } },
          buyer: { select: { id: true, fullName: true, email: true } },
          seller: { select: { id: true, fullName: true, sellerProfile: { select: { businessName: true } } } },
        },
      }),
      prisma.payment.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
        include: {
          user: { select: { id: true, fullName: true, email: true } },
          vehicle: { select: { id: true, title: true } },
          order: { select: { id: true, seller: { select: { fullName: true, sellerProfile: { select: { businessName: true } } } } } },
        },
      }),
    ]);
    return ok(res, {
      totals: {
        sales: sales.length,
        salesValue: sumBy(sales, (s) => s.amount),
        commission: sumBy(sales, (s) => s.commission),
        openRequests: requests.filter((r) => r.status === "PENDING").length,
        successfulPayments: sumBy(payments.filter((p) => p.status === "SUCCESS"), (p) => p.amount),
      },
      sales,
      requests: requests.map((r) => ({
        id: r.id,
        vehicleId: r.vehicleId,
        vehicle: r.vehicle?.title || "Vehicle",
        listedPrice: r.vehicle?.price ?? null,
        offerPrice: r.offerPrice,
        status: r.status,
        buyer: { id: r.buyerId, name: r.buyer?.fullName || r.buyerName, email: r.buyer?.email || r.buyerEmail, phone: r.buyerPhone },
        seller: r.seller ? { id: r.seller.id, name: sellerDisplayName(r.seller) } : null,
        createdAt: r.createdAt,
        respondedAt: r.respondedAt,
        rejectReason: r.rejectReason,
      })),
      payments: payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        provider: p.provider,
        status: p.status,
        reference: p.reference,
        createdAt: p.createdAt,
        buyer: p.user ? { id: p.user.id, name: p.user.fullName || p.user.email } : null,
        vehicle: p.vehicle?.title || null,
        seller: p.order?.seller ? sellerDisplayName(p.order.seller) : null,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// NOTIFICATIONS (the admin's own)
// ============================================================
export const getNotifications = async (req, res, next) => {
  try {
    const [rows, unreadCount] = await Promise.all([
      prisma.notification.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: "desc" }, take: 100 }),
      prisma.notification.count({ where: { userId: req.user.id, isRead: false } }),
    ]);
    const notifications = rows.map((n) => ({
      ...n,
      description: n.message,
      read: n.isRead,
      time: timeAgo(n.createdAt),
    }));
    return ok(res, { notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    const { count } = await prisma.notification.updateMany({ where: { userId: req.user.id, isRead: false }, data: { isRead: true } });
    return ok(res, { updated: count }, "All notifications marked as read");
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({ where: { id: req.params.id, userId: req.user.id }, data: { isRead: true } });
    return ok(res, null, "Notification marked as read");
  } catch (error) {
    next(error);
  }
};

// ============================================================
// MESSAGES (conversations the admin takes part in)
// ============================================================
const AVATAR_COLORS = ["from-[#001f3f] to-[#2d6cdf]", "from-emerald-500 to-teal-600", "from-amber-500 to-orange-600", "from-violet-500 to-purple-600", "from-rose-500 to-pink-600"];
const roleLabel = { SELLER: "Seller", DEALER: "Dealer", BUYER: "Buyer", INSPECTOR: "Field Inspector", ADMIN: "Admin" };

const toConversation = (c, adminId, index) => {
  const other = c.participants.map((p) => p.user).find((u) => u && u.id !== adminId);
  const mine = c.participants.find((p) => p.userId === adminId);
  const messages = c.messages.map((m) => ({
    id: m.id,
    sender: m.senderId === adminId || m.senderType === "ADMIN" ? "admin" : "user",
    text: m.text,
    time: m.createdAt,
  }));
  const unread = c.messages.filter((m) => m.senderId !== adminId && (!mine?.lastReadAt || m.createdAt > mine.lastReadAt)).length;
  return {
    id: c.id,
    userId: other?.id || null,
    name: other?.sellerProfile?.businessName || other?.fullName || other?.email || "User",
    role: roleLabel[other?.role] || "User",
    avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
    unread,
    updatedAt: c.updatedAt,
    messages: messages.length ? messages : [],
  };
};

export const getConversations = async (req, res, next) => {
  try {
    const rows = await prisma.conversation.findMany({
      where: { participants: { some: { userId: req.user.id } } },
      orderBy: { updatedAt: "desc" },
      include: {
        participants: { include: { user: { select: { id: true, fullName: true, email: true, role: true, sellerProfile: { select: { businessName: true } } } } } },
        messages: { orderBy: { createdAt: "asc" } },
      },
    });
    const conversations = rows.map((c, i) => toConversation(c, req.user.id, i));
    return ok(res, { conversations, unreadCount: conversations.reduce((s, c) => s + c.unread, 0) });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const text = String(req.body?.text || "").trim();
    if (!text) return fail(res, "Message can't be empty");
    const convo = await prisma.conversation.findFirst({ where: { id: req.params.id, participants: { some: { userId: req.user.id } } } });
    if (!convo) return fail(res, "Conversation not found", 404);
    const now = new Date();
    const message = await prisma.message.create({ data: { conversationId: convo.id, senderId: req.user.id, senderType: "ADMIN", text } });
    await prisma.conversation.update({ where: { id: convo.id }, data: { updatedAt: now } });
    await prisma.conversationParticipant.updateMany({ where: { conversationId: convo.id, userId: req.user.id }, data: { lastReadAt: now } });
    const others = await prisma.conversationParticipant.findMany({ where: { conversationId: convo.id, NOT: { userId: req.user.id } }, select: { userId: true } });
    if (others.length) {
      await prisma.notification.createMany({
        data: others.map((o) => ({ userId: o.userId, type: "NEW_MESSAGE", title: "New message from VehicleHub admin", message: text.slice(0, 140), metadata: { conversationId: convo.id } })),
      });
    }
    return ok(res, { id: message.id, sender: "admin", text: message.text, time: message.createdAt }, "Message sent", 201);
  } catch (error) {
    next(error);
  }
};

export const markConversationRead = async (req, res, next) => {
  try {
    await prisma.conversationParticipant.updateMany({ where: { conversationId: req.params.id, userId: req.user.id }, data: { lastReadAt: new Date() } });
    return ok(res, null, "Conversation marked as read");
  } catch (error) {
    next(error);
  }
};

// ============================================================
// FIELD INSPECTIONS (admin assigns a Field Inspector to a vehicle)
// ============================================================
export const getInspectors = async (req, res, next) => {
  try {
    const inspectors = await prisma.user.findMany({
      where: { role: "INSPECTOR", isActive: true, isBlocked: false },
      orderBy: { fullName: "asc" },
      select: { id: true, fullName: true, email: true, phone: true, _count: { select: { assignedInspections: { where: { status: { in: ["ASSIGNED", "ACCEPTED", "IN_PROGRESS"] } } } } } },
    });
    return ok(res, inspectors.map(({ _count, ...u }) => ({ ...u, openInspections: _count.assignedInspections })));
  } catch (error) {
    next(error);
  }
};

export const getInspections = async (req, res, next) => {
  try {
    const where = req.query.vehicleId ? { vehicleId: String(req.query.vehicleId) } : {};
    const rows = await prisma.inspection.findMany({ where, orderBy: { createdAt: "desc" }, take: 200, include: inspectionInclude });
    return ok(res, rows.map((i) => toInspectionDTO(i)));
  } catch (error) {
    next(error);
  }
};

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

// body: { vehicleId, inspectorId, scheduledAt, priority?, deadline? } — re-assigns the open inspection if there is one
export const assignInspection = async (req, res, next) => {
  try {
    const b = req.body || {};
    const scheduledAt = b.scheduledAt ? new Date(b.scheduledAt) : null;
    if (!b.vehicleId || !b.inspectorId) return fail(res, "Choose a vehicle and a field inspector");
    if (!scheduledAt || Number.isNaN(scheduledAt.getTime())) return fail(res, "Choose a valid inspection date and time");
    const deadline = b.deadline ? new Date(b.deadline) : null;
    const priority = PRIORITIES.includes(String(b.priority).toUpperCase()) ? String(b.priority).toUpperCase() : "MEDIUM";

    const [vehicle, inspector] = await Promise.all([
      prisma.vehicle.findUnique({ where: { id: b.vehicleId }, select: { id: true, title: true, sellerId: true, city: true } }),
      prisma.user.findFirst({ where: { id: b.inspectorId, role: "INSPECTOR", isActive: true }, select: { id: true, fullName: true } }),
    ]);
    if (!vehicle) return fail(res, "Vehicle not found", 404);
    if (!inspector) return fail(res, "Field inspector not found", 404);

    const open = await prisma.inspection.findFirst({
      where: { vehicleId: vehicle.id, status: { in: ["PENDING", "ASSIGNED", "ACCEPTED"] } },
      orderBy: { createdAt: "desc" },
    });
    const now = new Date();
    const data = {
      inspectorId: inspector.id,
      scheduledAt,
      deadline: deadline && !Number.isNaN(deadline.getTime()) ? deadline : null,
      priority,
      status: "ASSIGNED",
      assignedAt: now,
      assignedById: req.user.id,
      acceptedAt: null,
    };
    const inspection = open
      ? await prisma.inspection.update({ where: { id: open.id }, data })
      : await prisma.inspection.create({ data: { vehicleId: vehicle.id, ...data } });

    const when = scheduledAt.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
    await prisma.notification.createMany({
      data: [
        { userId: inspector.id, type: "INSPECTION_SCHEDULED", title: "New inspection assigned", message: `Inspect ${vehicle.title} on ${when}.`, metadata: { inspectionId: inspection.id, vehicleId: vehicle.id } },
        ...(vehicle.sellerId ? [{ userId: vehicle.sellerId, type: "INSPECTION_SCHEDULED", title: "Field inspection scheduled", message: `${inspector.fullName || "A field inspector"} will inspect ${vehicle.title} on ${when}.`, metadata: { inspectionId: inspection.id, vehicleId: vehicle.id } }] : []),
      ],
    });
    await prisma.activityLog.create({ data: { userId: req.user.id, action: "inspection.assigned", entityType: "Inspection", entityId: inspection.id, metadata: { vehicleId: vehicle.id, inspectorId: inspector.id } } });

    const fresh = await prisma.inspection.findUnique({ where: { id: inspection.id }, include: inspectionInclude });
    return ok(res, toInspectionDTO(fresh), `Inspection ${inspectionNo(inspection)} assigned to ${inspector.fullName || "the inspector"}`, open ? 200 : 201);
  } catch (error) {
    next(error);
  }
};