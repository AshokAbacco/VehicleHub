// VehicleHub/VehicleHub_Server/src/controllers/accountController.js
// ============================================================
// Settings page — the signed-in user's own account (every role: Admin, Seller, Dealer,
// Buyer, Field Inspector). Mounted in routes/authRoutes.js.
//   GET   /api/auth/account   profile + address
//   PATCH /api/auth/account   { fullName, email, phone, address, city, state, pincode }
//
// Address: Sellers/Dealers keep it on their seller profile (the same address shown on
// their Business Profile); everyone else on the user record.
// Passwords are NOT changed here — the Settings page sends people to Forgot Password
// (email code). When the email changes, the old address gets a notice.
// ============================================================
import { prisma } from "../config/db.js";
import { normalizePhone } from "../utils/phone.js";
import { sendMail, missingMailSettings } from "../services/msMailer.js";
import { emailLayout, escapeHtml, supportContacts } from "../services/emailLayout.js";
import { COMPANY } from "../services/invoicePdf.js";

const ok = (res, data, message = "OK") => res.json({ success: true, message, data });
const fail = (res, message, status = 400, extra = {}) => res.status(status).json({ success: false, message, ...extra });
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean = (v) => String(v ?? "").trim().replace(/\s+/g, " ");

const userSelect = {
  id: true, fullName: true, email: true, phone: true, role: true, isVerified: true, createdAt: true,
  address: true, city: true, state: true, pincode: true,
  sellerProfile: {
    select: { id: true, sellerType: true, businessName: true, verificationStatus: true, address: true, city: true, state: true, pincode: true },
  },
};

const toAccount = (u) => {
  const sp = u.sellerProfile;
  const src = sp || u; // where the address lives
  return {
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    phone: u.phone,
    role: u.role,
    isVerified: u.isVerified,
    createdAt: u.createdAt,
    address: src.address || "",
    city: src.city || "",
    state: src.state || "",
    pincode: src.pincode || "",
    business: sp ? { businessName: sp.businessName, sellerType: sp.sellerType, verificationStatus: sp.verificationStatus } : null,
  };
};

export const getAccount = async (req, res, next) => {
  try {
    const u = await prisma.user.findUnique({ where: { id: req.user.id }, select: userSelect });
    if (!u) return fail(res, "Account not found", 404);
    return ok(res, toAccount(u));
  } catch (error) {
    next(error);
  }
};

const emailChangedHtml = (u, newEmail) =>
  emailLayout({
    subtitle: "Email address changed",
    width: 560,
    body: `
    <p style="margin:0 0 12px">Dear ${escapeHtml(u.fullName || "Customer")},</p>
    <p style="margin:0 0 12px">The email address on your ${COMPANY.name} account was changed to
      <strong>${escapeHtml(newEmail)}</strong>. From now on, sign-in codes and account emails go to the new address.</p>
    <p style="margin:0;color:#b91c1c">If you didn't make this change, contact us right away at ${supportContacts("#b91c1c")}.</p>`,
  });

export const updateAccount = async (req, res, next) => {
  try {
    const current = await prisma.user.findUnique({ where: { id: req.user.id }, select: userSelect });
    if (!current) return fail(res, "Account not found", 404);
    const b = req.body || {};
    const errors = {};

    const fullName = clean(b.fullName);
    if (fullName.length < 2 || fullName.length > 80) errors.fullName = "Enter your full name (2–80 characters).";

    const email = clean(b.email).toLowerCase();
    if (!EMAIL_RE.test(email) || email.length > 254) errors.email = "Enter a valid email address.";

    const phoneRaw = clean(b.phone);
    const phone = normalizePhone(phoneRaw);
    if (!phoneRaw) errors.phone = "Enter your mobile number.";
    else if (!/^\+91[6-9]\d{9}$/.test(phone)) errors.phone = "Enter a valid 10-digit mobile number.";

    const address = clean(b.address);
    const city = clean(b.city);
    const state = clean(b.state);
    const pincode = clean(b.pincode).replace(/\s/g, "");
    if (address.length > 200) errors.address = "Address is too long (maximum 200 characters).";
    if (city.length > 60) errors.city = "City name is too long.";
    if (state.length > 60) errors.state = "State name is too long.";
    if (pincode && !/^[1-9]\d{5}$/.test(pincode)) errors.pincode = "Enter a valid 6-digit PIN code.";

    if (!errors.email || !errors.phone) {
      const taken = await prisma.user.findMany({
        where: {
          NOT: { id: current.id },
          OR: [
            ...(!errors.email ? [{ email: { equals: email, mode: "insensitive" } }] : []),
            ...(!errors.phone ? [{ phone }] : []),
          ],
        },
        select: { email: true, phone: true },
      });
      if (!errors.email && taken.some((t) => t.email?.toLowerCase() === email)) errors.email = "Another account already uses this email.";
      if (!errors.phone && taken.some((t) => t.phone === phone)) errors.phone = "Another account already uses this mobile number.";
    }
    if (Object.keys(errors).length) return fail(res, Object.values(errors)[0], 400, { errors });

    const addressData = { address: address || null, city: city || null, state: state || null, pincode: pincode || null };
    const sp = current.sellerProfile;
    await prisma.$transaction([
      prisma.user.update({
        where: { id: current.id },
        data: {
          fullName,
          lastName: fullName.split(" ").slice(1).join(" ") || null,
          email,
          phone,
          ...(sp ? {} : addressData),
        },
      }),
      ...(sp ? [prisma.sellerProfile.update({ where: { id: sp.id }, data: { ownerName: fullName, ...addressData } })] : []),
    ]);

    const emailChanged = email !== String(current.email || "").toLowerCase();
    if (emailChanged && current.email && !missingMailSettings().length) {
      setImmediate(() => {
        sendMail({ to: current.email, subject: `Your ${COMPANY.name} email address was changed`, html: emailChangedHtml(current, email) })
          .catch((err) => console.error("Email-changed notice failed:", err?.message));
      });
    }
    await prisma.activityLog.create({
      data: { userId: current.id, action: "account.updated", entityType: "User", entityId: current.id, metadata: { emailChanged } },
    }).catch(() => {});

    const fresh = await prisma.user.findUnique({ where: { id: current.id }, select: userSelect });
    return ok(res, toAccount(fresh), "Your details have been saved.");
  } catch (error) {
    if (error?.code === "P2002") return fail(res, "Another account already uses this email or mobile number.", 409);
    next(error);
  }
};