// VehicleHub/VehicleHub_Server/src/controllers/pricingController.js
// ============================================================
// Pricing page — Premium plan purchase through Razorpay.
//
//   GET  /api/pricing/plans    prices for the page (the backend is the source of truth)
//   POST /api/pricing/order    validate the form, work out the amount HERE, create a Razorpay order
//   POST /api/pricing/verify   check the Razorpay signature, then ask Razorpay itself that the
//                              payment was captured for that order and amount, and only then
//                              save one SubscriptionPayment row (status SUCCESS)
//
// Nothing is written to the database before the payment is verified, so a failed, cancelled or
// pending payment never creates a record. The frontend's "success" callback is never trusted on
// its own: the signature AND Razorpay's own payment/order data must match.
//
// Backend .env:
//   RAZORPAY_KEY=      Key ID     (public — sent to the browser to open Checkout)
//   RAZORPAY_SECRET=   Key Secret (never leaves the server)
// ============================================================
import crypto from "crypto";
import { prisma } from "../config/db.js";
import { normalizePhone } from "../utils/phone.js";
import { queueInvoiceEmail } from "../services/invoiceEmail.js";

// ---------- plans & prices ----------
export const PLAN = "PREMIUM";
export const MONTHLY_PRICE = { URBAN: 500, RURAL: 350 }; // ₹ per month
export const DURATIONS = [1, 3, 6, 12]; // months

/** Amount in rupees for a location + duration, or null if either isn't valid. */
export const planAmount = (location, months) => {
  const monthly = MONTHLY_PRICE[String(location || "").toUpperCase()];
  const m = Number(months);
  if (!monthly || !DURATIONS.includes(m)) return null;
  return monthly * m;
};

const durationLabel = (m) => (m === 12 ? "Yearly" : m === 1 ? "1 Month" : `${m} Months`);

// ---------- Razorpay REST API (no SDK needed) ----------
const RZP_API = () => (process.env.RAZORPAY_API_BASE || "https://api.razorpay.com/v1").replace(/\/+$/, "");
const envValue = (name) => String(process.env[name] || "").trim().replace(/^["']|["']$/g, "").trim();
const keyId = () => envValue("RAZORPAY_KEY");
const keySecret = () => envValue("RAZORPAY_SECRET");
const razorpayConfigured = () => Boolean(keyId() && keySecret());

class RazorpayError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const razorpay = async (method, path, body) => {
  const res = await fetch(`${RZP_API()}${path}`, {
    method,
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId()}:${keySecret()}`).toString("base64")}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(20000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new RazorpayError(data?.error?.description || `Razorpay HTTP ${res.status}`, res.status, data?.error?.code);
  }
  return data;
};

// ---------- validation ----------
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean = (v) => String(v ?? "").trim().replace(/\s+/g, " ");

const validateOrderForm = (b = {}) => {
  const shopName = clean(b.shopName);
  const fullName = clean(b.fullName);
  const email = clean(b.email).toLowerCase();
  const phoneDigits = String(b.phone ?? "").replace(/\D/g, "");
  const location = String(b.locationCategory || b.location || "").toUpperCase();
  const durationMonths = Number(b.durationMonths || b.duration);
  const errors = {};

  if (!shopName) errors.shopName = "Please enter your shop name.";
  else if (shopName.length < 2 || shopName.length > 100) errors.shopName = "Shop name must be between 2 and 100 characters.";
  if (!fullName) errors.fullName = "Please enter your full name.";
  else if (fullName.length < 2 || fullName.length > 100) errors.fullName = "Full name must be between 2 and 100 characters.";
  // Indian mobile: 10 digits starting 6-9 (with or without +91 / 0)
  const ten = phoneDigits.length === 12 && phoneDigits.startsWith("91") ? phoneDigits.slice(2)
    : phoneDigits.length === 11 && phoneDigits.startsWith("0") ? phoneDigits.slice(1) : phoneDigits;
  if (!phoneDigits) errors.phone = "Please enter your phone number.";
  else if (!/^[6-9]\d{9}$/.test(ten)) errors.phone = "Please enter a valid 10-digit mobile number.";
  if (!email) errors.email = "Please enter your email address.";
  else if (!EMAIL_RE.test(email) || email.length > 254) errors.email = "Please enter a valid email address.";
  if (String(b.plan || PLAN).toUpperCase() !== PLAN) errors.plan = "Please choose a valid plan.";
  if (!MONTHLY_PRICE[location]) errors.locationCategory = "Please choose Urban or Rural.";
  if (!DURATIONS.includes(durationMonths)) errors.durationMonths = "Please choose 1, 3, 6 or 12 months.";

  return { shopName, fullName, email, phone: normalizePhone(ten), location, durationMonths, errors };
};

const unavailable = (res) =>
  res.status(503).json({ success: false, message: "Online payment is not available right now. Please try again later." });

const toPublic = (p) => ({
  id: p.id,
  shopName: p.shopName,
  fullName: p.fullName,
  phone: p.phone,
  email: p.email,
  plan: p.plan,
  locationCategory: p.locationCategory,
  durationMonths: p.durationMonths,
  durationLabel: durationLabel(p.durationMonths),
  amount: p.amount,
  currency: p.currency,
  razorpayOrderId: p.razorpayOrderId,
  razorpayPaymentId: p.razorpayPaymentId,
  status: p.status,
  paidAt: p.paidAt,
});

// ---------- existing accounts ----------
// A plan is bought before seller registration, which creates the login — so the email / phone
// must not already belong to another account. (A signed-in user may use their own details.)
const ACCOUNT_EXISTS_MSG = {
  email: "An account with this email already exists. Please sign in to continue, or use a different email.",
  phone: "An account with this phone number already exists. Please sign in to continue, or use a different number.",
};

const findAccountConflicts = async ({ email, phone }, currentUserId) => {
  const errors = {};
  const digits = String(phone || "").replace(/\D/g, "").slice(-10);
  const [byEmail, byPhone] = await Promise.all([
    email ? prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } }, select: { id: true } }) : null,
    digits.length === 10
      ? prisma.user.findFirst({ where: { phone: { in: [`+91${digits}`, digits, `91${digits}`, `0${digits}`] } }, select: { id: true } })
      : null,
  ]);
  if (byEmail && byEmail.id !== currentUserId) errors.email = ACCOUNT_EXISTS_MSG.email;
  if (byPhone && byPhone.id !== currentUserId) errors.phone = ACCOUNT_EXISTS_MSG.phone;
  return errors;
};

// ============================================================
// POST /api/pricing/check-account   { email?, phone? } -> which ones are already registered
// (used by the payment form while typing; createOrder checks again, so this is only a hint)
// ============================================================
export const checkAccount = async (req, res, next) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const phone = String(req.body?.phone || "").trim();
    const errors = await findAccountConflicts({ email: EMAIL_RE.test(email) ? email : "", phone }, req.user?.id);
    return res.json({ success: true, data: { emailTaken: Boolean(errors.email), phoneTaken: Boolean(errors.phone), errors } });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET /api/pricing/plans
// ============================================================
export const getPlans = (req, res) => {
  const build = (location) =>
    DURATIONS.map((months) => ({ months, label: durationLabel(months), amount: planAmount(location, months), monthly: MONTHLY_PRICE[location] }));
  res.json({
    success: true,
    data: {
      plan: PLAN,
      currency: "INR",
      durations: DURATIONS.map((m) => ({ months: m, label: durationLabel(m) })),
      monthly: MONTHLY_PRICE,
      prices: { URBAN: build("URBAN"), RURAL: build("RURAL") },
      paymentsEnabled: razorpayConfigured(),
    },
  });
};

// ============================================================
// POST /api/pricing/order   { shopName, fullName, phone, email, plan, locationCategory, durationMonths }
// ============================================================
export const createOrder = async (req, res) => {
  const f = validateOrderForm(req.body);
  if (Object.keys(f.errors).length) {
    return res.status(400).json({ success: false, message: Object.values(f.errors)[0], errors: f.errors });
  }
  // Email / phone already registered to another account -> no payment
  try {
    const taken = await findAccountConflicts({ email: f.email, phone: f.phone }, req.user?.id);
    if (Object.keys(taken).length) {
      return res.status(409).json({ success: false, code: "ACCOUNT_EXISTS", message: Object.values(taken)[0], errors: taken });
    }
  } catch (err) {
    console.error("Pricing: account check failed:", err?.message);
    return res.status(500).json({ success: false, message: "Couldn't start the payment. Please try again in a moment." });
  }
  if (!razorpayConfigured()) {
    console.error("Pricing: RAZORPAY_KEY / RAZORPAY_SECRET missing in .env");
    return unavailable(res);
  }

  const amount = planAmount(f.location, f.durationMonths); // ₹ — never taken from the browser
  try {
    const order = await razorpay("POST", "/orders", {
      amount: amount * 100, // paise
      currency: "INR",
      receipt: `vh_${Date.now().toString(36)}_${crypto.randomBytes(3).toString("hex")}`,
      // Everything needed to save the payment later, kept on Razorpay's side of the order
      notes: {
        app: "vehiclehub-pricing",
        plan: PLAN,
        locationCategory: f.location,
        durationMonths: String(f.durationMonths),
        shopName: f.shopName,
        fullName: f.fullName,
        phone: f.phone,
        email: f.email,
        ...(req.user?.id ? { userId: req.user.id } : {}),
      },
    });
    return res.status(201).json({
      success: true,
      data: {
        keyId: keyId(), // public key id only
        orderId: order.id,
        amount: order.amount, // paise
        currency: order.currency,
        plan: PLAN,
        locationCategory: f.location,
        durationMonths: f.durationMonths,
        durationLabel: durationLabel(f.durationMonths),
        prefill: { name: f.fullName, email: f.email, contact: f.phone },
      },
    });
  } catch (err) {
    console.error("Razorpay create order failed:", err.status || "", err.code || "", err.message);
    if (err.status === 401) {
      console.error(
        `Razorpay rejected the API keys. Check that RAZORPAY_KEY (now "${keyId().slice(0, 12)}…") and RAZORPAY_SECRET are a matching pair ` +
          "from the same mode (Test keys start with rzp_test_, Live keys with rzp_live_), then restart the server.",
      );
    }
    return res.status(502).json({
      success: false,
      message: "Couldn't start the payment. Please try again in a moment.",
      // the reason, while developing (hidden when NODE_ENV=production)
      ...(process.env.NODE_ENV !== "production" ? { detail: `Razorpay: ${err.message}` } : {}),
    });
  }
};

// ============================================================
// POST /api/pricing/verify   { razorpay_order_id, razorpay_payment_id, razorpay_signature }
// ============================================================
export const verifyPayment = async (req, res) => {
  const orderId = String(req.body?.razorpay_order_id || "").trim();
  const paymentId = String(req.body?.razorpay_payment_id || "").trim();
  const signature = String(req.body?.razorpay_signature || "").trim();

  if (!/^order_[A-Za-z0-9]+$/.test(orderId) || !/^pay_[A-Za-z0-9]+$/.test(paymentId) || !/^[a-f0-9]{64}$/i.test(signature)) {
    return res.status(400).json({ success: false, message: "Payment details are missing or invalid." });
  }
  if (!razorpayConfigured()) return unavailable(res);

  // 1) Signature: HMAC-SHA256(order_id|payment_id, key secret)
  const expected = crypto.createHmac("sha256", keySecret()).update(`${orderId}|${paymentId}`).digest("hex");
  if (!crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signature.toLowerCase(), "hex"))) {
    console.warn("Pricing verify: signature mismatch for", orderId, paymentId);
    return res.status(400).json({ success: false, message: "We couldn't verify this payment. If money was deducted, please contact support." });
  }

  const result = await confirmAndSavePayment(orderId, paymentId, req.user?.id);
  return res.status(result.code).json(result.body);
};

// ============================================================
// Shared by /verify and the webhook: ask Razorpay what really happened, then save exactly
// one SUCCESS row. Returns { code, body } — never throws (see confirmAndSavePayment).
// ============================================================
const fail = (code, message, extra = {}) => ({ code, body: { success: false, message, ...extra } });

const confirmAndSavePayment = async (orderId, paymentId, fallbackUserId = null) => {
  try {
    return await confirmAndSaveUnsafe(orderId, paymentId, fallbackUserId);
  } catch (err) {
    console.error("Pricing confirm failed:", err?.code || "", err?.message);
    return fail(500, "Something went wrong while saving your payment. Please don't pay again — contact support.");
  }
};

const confirmAndSaveUnsafe = async (orderId, paymentId, fallbackUserId) => {
  // Already saved (e.g. verify called twice, or the webhook got there first) -> same answer, no second row
  const existing = await prisma.subscriptionPayment.findFirst({
    where: { OR: [{ razorpayPaymentId: paymentId }, { razorpayOrderId: orderId }] },
  });
  if (existing) {
    if (existing.razorpayPaymentId !== paymentId) return fail(409, "This order has already been paid.");
    return { code: 200, body: { success: true, message: "Payment verified", data: toPublic(existing) } };
  }

  try {
    // 2) Ask Razorpay what really happened — never trust the browser alone
    const order = await razorpay("GET", `/orders/${encodeURIComponent(orderId)}`);
    const n = order.notes || {};
    const expectedAmount = planAmount(n.locationCategory, n.durationMonths);
    if (n.app !== "vehiclehub-pricing" || n.plan !== PLAN || !expectedAmount || order.amount !== expectedAmount * 100 || order.currency !== "INR") {
      console.warn("Pricing verify: order does not match a VehicleHub plan", orderId, order.amount, n);
      return fail(400, "This payment doesn't match a VehicleHub plan. Please contact support.");
    }

    let payment = await razorpay("GET", `/payments/${encodeURIComponent(paymentId)}`);
    if (payment.order_id !== orderId || payment.amount !== order.amount || payment.currency !== "INR") {
      console.warn("Pricing verify: payment does not belong to the order", paymentId, orderId);
      return fail(400, "This payment doesn't match the order. Please contact support.");
    }
    // Accounts without auto-capture leave payments "authorized" — capture it now
    if (payment.status === "authorized") {
      payment = await razorpay("POST", `/payments/${encodeURIComponent(paymentId)}/capture`, { amount: order.amount, currency: "INR" });
    }
    if (payment.status !== "captured") {
      return fail(
        402,
        payment.status === "failed" ? "The payment failed. No money has been taken." : "The payment hasn't completed yet. Please try again.",
        { paymentStatus: payment.status },
      );
    }

    // 3) Verified -> save exactly one SUCCESS row (unique order + payment ids)
    let row;
    let created = false;
    try {
      row = await prisma.subscriptionPayment.create({
        data: {
          shopName: n.shopName,
          fullName: n.fullName,
          phone: n.phone,
          email: n.email,
          plan: PLAN,
          locationCategory: n.locationCategory,
          durationMonths: Number(n.durationMonths),
          amount: order.amount / 100,
          currency: "INR",
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId,
          status: "SUCCESS",
          paidAt: payment.created_at ? new Date(payment.created_at * 1000) : new Date(),
          userId: n.userId || fallbackUserId || null,
        },
      });
      created = true;
    } catch (e) {
      if (e?.code !== "P2002") throw e; // a parallel verify saved it first
      row = await prisma.subscriptionPayment.findUnique({ where: { razorpayPaymentId: paymentId } });
      if (!row) return fail(409, "This order has already been paid.");
    }

    // Verified and saved -> email the invoice in the background (never delays or breaks the flow;
    // the claim inside sendInvoiceForPayment stops a second email for the same payment)
    if (created) queueInvoiceEmail(row.id);

    return { code: 201, body: { success: true, message: "Payment verified", data: toPublic(row) } };
  } catch (err) {
    console.error("Pricing confirm failed:", err.status || "", err.code || "", err.message);
    return fail(502, "We couldn't confirm your payment with Razorpay just now. Please don't pay again — try refreshing in a minute or contact support.");
  }
};

// ============================================================
// POST /api/pricing/webhook — Razorpay → server (Dashboard → Settings → Webhooks)
//   URL:    https://<your-backend>/api/pricing/webhook
//   Secret: the same value as RAZORPAY_WEBHOOK_SECRET in .env
//   Events: payment.captured, order.paid
// A safety net for when the buyer pays but closes the tab before /verify runs: the payment
// is still confirmed with Razorpay and saved once (the unique ids stop a second row).
// ============================================================
const webhookSecret = () => envValue("RAZORPAY_WEBHOOK_SECRET");

export const razorpayWebhook = async (req, res) => {
  const secret = webhookSecret();
  if (!secret) {
    console.error("Razorpay webhook received but RAZORPAY_WEBHOOK_SECRET is not set in .env");
    return res.status(503).json({ success: false });
  }
  const signature = String(req.headers["x-razorpay-signature"] || "");
  const raw = req.rawBody; // exact bytes Razorpay signed (kept by express.json in app.js)
  if (!raw || !/^[a-f0-9]{64}$/i.test(signature)) return res.status(400).json({ success: false });

  const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  if (!crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signature.toLowerCase(), "hex"))) {
    console.warn("Razorpay webhook: bad signature — check RAZORPAY_WEBHOOK_SECRET matches the webhook's secret");
    return res.status(400).json({ success: false });
  }

  const event = req.body?.event;
  const pay = req.body?.payload?.payment?.entity;
  if (!["payment.captured", "order.paid"].includes(event) || !pay?.id || !pay?.order_id) {
    return res.json({ success: true, ignored: true }); // other events: acknowledge and ignore
  }
  if (!razorpayConfigured()) return res.status(503).json({ success: false });

  const result = await confirmAndSavePayment(pay.order_id, pay.id);
  if (result.code >= 500) return res.status(500).json({ success: false }); // Razorpay will retry later
  if (result.code >= 400 && result.code !== 409) {
    // not one of our plan orders (or not captured) — nothing to save; don't make Razorpay retry
    console.warn("Razorpay webhook:", event, pay.id, "not saved:", result.body.message);
  }
  return res.json({ success: true });
};