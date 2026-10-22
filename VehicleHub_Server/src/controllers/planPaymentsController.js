// VehicleHub/VehicleHub_Server/src/controllers/planPaymentsController.js
// ============================================================
// Admin — Plan Payments. GET /api/admin/plan-payments (routes/adminRoutes.js, ADMIN only)
// Built from the SubscriptionPayment table (Pricing page payments, verified with Razorpay)
// and the matching User / SellerProfile.
//
// Plan period: a plan starts on its payment date and runs for durationMonths. If the customer
// pays again before the current plan ends (renewal), the new plan starts when the current one
// ends, so no paid days are lost.
//
// Plan status: ACTIVE | EXPIRING_SOON (≤ 7 days left, no renewal after it) | UPCOMING (renewal
// not started yet) | EXPIRED | NOT_ACTIVE (payment not successful).
//
// Query: search, planStatus, paymentStatus, location (URBAN|RURAL), duration (1|3|6|12),
//        from, to (payment date, YYYY-MM-DD), sort (paidAt|amount|expiry|remainingDays|name),
//        order (asc|desc), page, limit (max 100)
// ============================================================
import { prisma } from "../config/db.js";

const DAY = 24 * 60 * 60 * 1000;
export const EXPIRING_SOON_DAYS = 7;

// Calendar months, clamped (31 Jan + 1 month = 28/29 Feb)
const addMonths = (date, months) => {
  const d = new Date(date);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + Number(months || 0));
  d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
  return d;
};

const durationText = (m) => (Number(m) === 12 ? "12 months" : Number(m) === 1 ? "1 month" : `${m} months`);
const locationText = (l) => (l === "RURAL" ? "Rural" : "Urban");
const planName = (p) => `${p.plan === "PREMIUM" ? "Premium" : p.plan} · ${locationText(p.locationCategory)} · ${durationText(p.durationMonths)}`;
const lower = (v) => String(v || "").trim().toLowerCase();

const accountStatusOf = (user) => {
  if (!user) return { code: "NOT_REGISTERED", label: "Not registered" };
  if (user.isBlocked) return { code: "BLOCKED", label: "Blocked" };
  if (!user.isActive) return { code: "INACTIVE", label: "Inactive" };
  const sp = user.sellerProfile;
  if (sp) {
    const map = {
      APPROVED: { code: "APPROVED", label: "Approved" },
      PENDING: { code: "PENDING_APPROVAL", label: "Pending approval" },
      REJECTED: { code: "REJECTED", label: "Rejected" },
      SUSPENDED: { code: "SUSPENDED", label: "Suspended" },
    };
    return map[sp.verificationStatus] || { code: "ACTIVE", label: "Active" };
  }
  return { code: "ACTIVE", label: "Active" };
};

/** Every plan payment with its plan period, statuses and customer — newest first. */
export const buildPlanRows = async (now = new Date()) => {
  const payments = await prisma.subscriptionPayment.findMany({ orderBy: { paidAt: "asc" } });
  if (!payments.length) return [];

  // Match each payment to its account: the paying user, the seller profile, else email / phone
  const profileIds = [...new Set(payments.map((p) => p.sellerProfileId).filter(Boolean))];
  const profiles = profileIds.length
    ? await prisma.sellerProfile.findMany({ where: { id: { in: profileIds } }, select: { id: true, userId: true } })
    : [];
  const userIdByProfile = new Map(profiles.map((p) => [p.id, p.userId]));
  const userIds = [...new Set([...payments.map((p) => p.userId), ...profiles.map((p) => p.userId)].filter(Boolean))];
  const emails = [...new Set(payments.map((p) => lower(p.email)).filter(Boolean))];
  const phones = [...new Set(payments.map((p) => p.phone).filter(Boolean))];
  const users = await prisma.user.findMany({
    where: {
      OR: [
        ...(userIds.length ? [{ id: { in: userIds } }] : []),
        ...(emails.length ? [{ email: { in: emails, mode: "insensitive" } }] : []),
        ...(phones.length ? [{ phone: { in: phones } }] : []),
      ],
    },
    select: {
      id: true, fullName: true, email: true, phone: true, role: true, isActive: true, isBlocked: true,
      sellerProfile: { select: { id: true, businessName: true, verificationStatus: true } },
    },
  });
  const byId = new Map(users.map((u) => [u.id, u]));
  const byEmail = new Map(users.map((u) => [lower(u.email), u]));
  const byPhone = new Map(users.filter((u) => u.phone).map((u) => [u.phone, u]));
  const userFor = (p) =>
    byId.get(p.userId) || byId.get(userIdByProfile.get(p.sellerProfileId)) || byEmail.get(lower(p.email)) || byPhone.get(p.phone) || null;

  // Group by customer and lay their plans end to end
  const rows = [];
  const lastEndByCustomer = new Map();
  for (const p of payments) {
    const user = userFor(p);
    const customerKey = user ? `u:${user.id}` : `e:${lower(p.email) || p.phone}`;
    const paid = p.status === "SUCCESS";
    let start = null;
    let expiry = null;
    if (paid) {
      const prevEnd = lastEndByCustomer.get(customerKey);
      start = prevEnd && prevEnd > p.paidAt ? prevEnd : p.paidAt;
      expiry = addMonths(start, p.durationMonths);
      lastEndByCustomer.set(customerKey, expiry);
    }
    rows.push({ p, user, customerKey, start, expiry });
  }

  return rows
    .map(({ p, user, customerKey, start, expiry }) => {
      const coverageEnd = lastEndByCustomer.get(customerKey) || null;
      let planStatus = "NOT_ACTIVE";
      let remainingDays = 0;
      if (start && expiry) {
        if (now < start) {
          planStatus = "UPCOMING";
          remainingDays = Math.ceil((expiry - now) / DAY);
        } else if (now < expiry) {
          remainingDays = Math.ceil((expiry - now) / DAY);
          // "expiring soon" only if nothing has been paid to follow it
          planStatus = remainingDays <= EXPIRING_SOON_DAYS && coverageEnd <= expiry ? "EXPIRING_SOON" : "ACTIVE";
        } else {
          planStatus = "EXPIRED";
        }
      }
      return {
        id: p.id,
        customerKey,
        userId: user?.id || null,
        name: user?.fullName || p.fullName,
        shopName: user?.sellerProfile?.businessName || p.shopName,
        email: p.email,
        phone: p.phone,
        role: user?.role || null,
        planName: planName(p),
        plan: p.plan,
        locationCategory: p.locationCategory,
        durationMonths: p.durationMonths,
        amount: p.amount,
        currency: p.currency,
        paymentStatus: p.status,
        paidAt: p.paidAt,
        planStart: start,
        planExpiry: expiry,
        remainingDays,
        planStatus,
        renewed: Boolean(expiry && coverageEnd > expiry),
        accountStatus: accountStatusOf(user),
        invoiceNumber: p.invoiceNumber,
        invoiceEmailStatus: p.invoiceEmailStatus,
        razorpayOrderId: p.razorpayOrderId,
        razorpayPaymentId: p.razorpayPaymentId,
      };
    })
    .reverse();
};

const summarize = (rows, now) => {
  const customers = new Map();
  let received = 0;
  let receivedCount = 0;
  for (const r of rows) {
    if (r.paymentStatus !== "SUCCESS") continue;
    received += Number(r.amount) || 0;
    receivedCount += 1;
    const c = customers.get(r.customerKey) || { active: false, expiring: false, end: null };
    if (r.planStatus === "ACTIVE" || r.planStatus === "EXPIRING_SOON") c.active = true;
    if (r.planStatus === "EXPIRING_SOON") c.expiring = true;
    if (!c.end || r.planExpiry > c.end) c.end = r.planExpiry;
    customers.set(r.customerKey, c);
  }
  const list = [...customers.values()];
  return {
    totalUsers: list.length,
    totalPaymentsReceived: Math.round(received * 100) / 100,
    paymentsCount: receivedCount,
    activePlans: list.filter((c) => c.active).length,
    expiredPlans: list.filter((c) => c.end && c.end <= now).length,
    expiringSoon: list.filter((c) => c.expiring).length,
    expiringSoonDays: EXPIRING_SOON_DAYS,
  };
};

const SORTS = {
  paidAt: (r) => new Date(r.paidAt).getTime(),
  amount: (r) => Number(r.amount) || 0,
  expiry: (r) => (r.planExpiry ? new Date(r.planExpiry).getTime() : 0),
  remainingDays: (r) => r.remainingDays,
  name: (r) => lower(r.name),
};
const PLAN_STATUSES = ["ACTIVE", "EXPIRING_SOON", "UPCOMING", "EXPIRED", "NOT_ACTIVE"];
const PAYMENT_STATUSES = ["SUCCESS", "PENDING", "FAILED", "REFUNDED"];

export const getPlanPayments = async (req, res, next) => {
  try {
    const now = new Date();
    const all = await buildPlanRows(now);
    const q = req.query || {};

    const search = lower(q.search);
    const planStatus = String(q.planStatus || "").toUpperCase();
    const paymentStatus = String(q.paymentStatus || "").toUpperCase();
    const location = String(q.location || "").toUpperCase();
    const duration = Number(q.duration) || null;
    const from = q.from ? new Date(`${q.from}T00:00:00`) : null;
    const to = q.to ? new Date(`${q.to}T23:59:59.999`) : null;

    let rows = all.filter((r) => {
      if (search && ![r.name, r.shopName, r.email, r.phone, r.planName, r.invoiceNumber, r.razorpayPaymentId].some((f) => lower(f).includes(search))) return false;
      if (PLAN_STATUSES.includes(planStatus) && r.planStatus !== planStatus) return false;
      if (PAYMENT_STATUSES.includes(paymentStatus) && r.paymentStatus !== paymentStatus) return false;
      if (["URBAN", "RURAL"].includes(location) && r.locationCategory !== location) return false;
      if (duration && r.durationMonths !== duration) return false;
      if (from && !Number.isNaN(from.getTime()) && new Date(r.paidAt) < from) return false;
      if (to && !Number.isNaN(to.getTime()) && new Date(r.paidAt) > to) return false;
      return true;
    });

    const sortKey = SORTS[q.sort] ? q.sort : "paidAt";
    const dir = String(q.order || "desc").toLowerCase() === "asc" ? 1 : -1;
    rows = [...rows].sort((a, b) => {
      const x = SORTS[sortKey](a);
      const y = SORTS[sortKey](b);
      return (x > y ? 1 : x < y ? -1 : 0) * dir;
    });

    const limit = Math.min(100, Math.max(5, Number(q.limit) || 10));
    const total = rows.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const page = Math.min(pages, Math.max(1, Number(q.page) || 1));

    return res.json({
      success: true,
      message: "OK",
      data: {
        summary: summarize(all, now),
        statusCounts: PLAN_STATUSES.reduce((acc, s) => ({ ...acc, [s]: all.filter((r) => r.planStatus === s).length }), {}),
        payments: rows.slice((page - 1) * limit, page * limit),
        pagination: { page, limit, total, pages },
        generatedAt: now,
      },
    });
  } catch (error) {
    next(error);
  }
};