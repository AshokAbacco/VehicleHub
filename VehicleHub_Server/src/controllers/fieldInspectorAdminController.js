// VehicleHub/VehicleHub_Server/src/controllers/fieldInspectorAdminController.js
// ============================================================
// Admin — Field Inspector accounts (routes/adminRoutes.js, ADMIN only)
//   GET    /api/admin/field-inspectors                 all inspectors + job counts
//   POST   /api/admin/field-inspectors                 { fullName, email, phone, password?, sendEmail? }
//   PATCH  /api/admin/field-inspectors/:id             { fullName?, email?, phone?, isActive?, password? }
//   POST   /api/admin/field-inspectors/:id/send-invite  emails the sign-in details again
//
// Passwords are never emailed. The welcome email links to Forgot Password, where the inspector
// sets their own password with a code sent to their email (or uses one the admin gave them).
// Deactivating is blocked while the inspector still has open jobs — reassign them first.
// ============================================================
import bcrypt from "bcryptjs";
import { prisma } from "../config/db.js";
import { normalizePhone } from "../utils/phone.js";
import { sendMail, missingMailSettings } from "../services/msMailer.js";
import { emailLayout, escapeHtml } from "../services/emailLayout.js";
import { COMPANY } from "../services/invoicePdf.js";
import { loginUrl } from "../services/registrationEmails.js";

const ok = (res, data, message = "OK", status = 200) => res.status(status).json({ success: true, message, data });
const fail = (res, message, status = 400, extra = {}) => res.status(status).json({ success: false, message, ...extra });

const OPEN = ["ASSIGNED", "ACCEPTED", "IN_PROGRESS"];
const PASSWORD_MIN = 6;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const select = {
  id: true, fullName: true, email: true, phone: true, isActive: true, isBlocked: true, createdAt: true, password: true,
};

const withStats = async (users) => {
  if (!users.length) return [];
  const ids = users.map((u) => u.id);
  const grouped = await prisma.inspection.groupBy({
    by: ["inspectorId", "status"],
    where: { inspectorId: { in: ids } },
    _count: { _all: true },
  });
  const last = await prisma.inspection.groupBy({
    by: ["inspectorId"],
    where: { inspectorId: { in: ids }, completedAt: { not: null } },
    _max: { completedAt: true },
  });
  const lastBy = new Map(last.map((l) => [l.inspectorId, l._max.completedAt]));
  return users.map(({ password, ...u }) => {
    const mine = grouped.filter((g) => g.inspectorId === u.id);
    const count = (statuses) => mine.filter((g) => statuses.includes(g.status)).reduce((n, g) => n + g._count._all, 0);
    return {
      ...u,
      hasPassword: Boolean(password),
      openInspections: count(OPEN),
      completedInspections: count(["COMPLETED"]),
      totalInspections: mine.reduce((n, g) => n + g._count._all, 0),
      lastCompletedAt: lastBy.get(u.id) || null,
    };
  });
};

const one = async (id) => (await withStats([await prisma.user.findUnique({ where: { id }, select })]))[0];

// ---------- welcome email ----------
const siteUrl = (path) => {
  const login = loginUrl(); // CORS_ORIGIN + /login
  return login ? login.replace(/\/login$/, path) : null;
};

const welcomeHtml = (u, { adminSetPassword }) => {
  const login = loginUrl();
  const setup = siteUrl("/forgot-password");
  const link = (url) => (url ? `<a href="${escapeHtml(url)}" style="color:#1d4ed8">${escapeHtml(url)}</a>` : "the MotorDesk website");
  const row = (k, v) => `
      <tr>
        <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;background:#f8fafc;color:#64748b;font-size:13px;width:40%">${k}</td>
        <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:13px;font-weight:bold">${v}</td>
      </tr>`;
  return emailLayout({
    subtitle: "Field Inspector account",
    body: `
    <p style="margin:0 0 12px">Dear ${escapeHtml(u.fullName)},</p>
    <p style="margin:0 0 14px">A <strong>Field Inspector</strong> account has been created for you on ${COMPANY.name}.
      You'll use it to see the vehicle inspections assigned to you and submit your verification reports.</p>
    <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;margin:0 0 16px">
      ${row("Login page", link(login))}
      ${row("Email", escapeHtml(u.email))}
      ${u.phone ? row("Mobile number", escapeHtml(u.phone)) : ""}
      ${row("Password", adminSetPassword ? "Use the password given to you by the MotorDesk admin." : "Set your own password (steps below).")}
    </table>
    ${adminSetPassword
      ? `<p style="margin:0 0 14px">For your security, change it after you sign in, or set a new one any time with <strong>Forgot password</strong>: ${link(setup)}</p>`
      : `<p style="margin:0 0 6px"><strong>Set your password:</strong></p>
    <ol style="margin:0 0 14px;padding-left:20px">
      <li>Open ${link(setup)}</li>
      <li>Enter your email or mobile number and request a code.</li>
      <li>Enter the 6-digit code we email you and choose your password.</li>
    </ol>`}
    <p style="margin:0 0 14px;color:#64748b;font-size:13px">We never send passwords by email.</p>
    <p style="margin:0">Best regards,<br><strong>${COMPANY.name} Team</strong></p>`,
  });
};

const sendWelcome = async (u, opts) => {
  const missing = missingMailSettings();
  if (missing.length) return { sent: false, reason: `Email is not configured (${missing.join(", ")})` };
  try {
    await sendMail({ to: { name: u.fullName, address: u.email }, subject: `Your ${COMPANY.name} Field Inspector account`, html: welcomeHtml(u, opts) });
    return { sent: true };
  } catch (err) {
    console.error("Inspector welcome email failed:", err?.message);
    return { sent: false, reason: "The email could not be sent" };
  }
};

// ---------- validation ----------
const clean = (v) => String(v ?? "").trim();
const validate = (b, { partial = false } = {}) => {
  const out = {};
  const errors = {};
  if (!partial || b.fullName !== undefined) {
    const v = clean(b.fullName).replace(/\s+/g, " ");
    if (v.length < 2 || v.length > 80) errors.fullName = "Enter the inspector's full name (2–80 characters).";
    else out.fullName = v;
  }
  if (!partial || b.email !== undefined) {
    const v = clean(b.email).toLowerCase();
    if (!EMAIL_RE.test(v) || v.length > 254) errors.email = "Enter a valid email address.";
    else out.email = v;
  }
  if (!partial || b.phone !== undefined) {
    const raw = clean(b.phone);
    const v = normalizePhone(raw);
    if (!raw) errors.phone = "Enter the inspector's mobile number.";
    else if (!v || !/^\+91[6-9]\d{9}$/.test(v)) errors.phone = "Enter a valid 10-digit mobile number.";
    else out.phone = v;
  }
  if (b.password !== undefined && clean(b.password) !== "") {
    const v = String(b.password);
    if (v.length < PASSWORD_MIN || v.length > 72) errors.password = `Password must be ${PASSWORD_MIN}–72 characters.`;
    else out.password = v;
  }
  return { out, errors };
};

const conflicts = async ({ email, phone }, exceptId) => {
  const or = [
    ...(email ? [{ email: { equals: email, mode: "insensitive" } }] : []),
    ...(phone ? [{ phone }] : []),
  ];
  if (!or.length) return {};
  const found = await prisma.user.findMany({
    where: { OR: or, ...(exceptId ? { NOT: { id: exceptId } } : {}) },
    select: { email: true, phone: true },
  });
  const errors = {};
  if (email && found.some((u) => u.email?.toLowerCase() === email)) errors.email = "Another account already uses this email.";
  if (phone && found.some((u) => u.phone === phone)) errors.phone = "Another account already uses this mobile number.";
  return errors;
};

const badRequest = (res, errors) => fail(res, Object.values(errors)[0], 400, { errors });

// ---------- handlers ----------
export const listFieldInspectors = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({ where: { role: "INSPECTOR" }, orderBy: [{ isActive: "desc" }, { fullName: "asc" }], select });
    return ok(res, await withStats(users));
  } catch (error) {
    next(error);
  }
};

export const createFieldInspector = async (req, res, next) => {
  try {
    const { out, errors } = validate(req.body || {});
    Object.assign(errors, await conflicts(out));
    if (Object.keys(errors).length) return badRequest(res, errors);

    const user = await prisma.user.create({
      data: {
        role: "INSPECTOR",
        fullName: out.fullName,
        lastName: out.fullName.split(" ").slice(1).join(" ") || null,
        email: out.email,
        phone: out.phone,
        password: out.password ? await bcrypt.hash(out.password, 10) : null,
        isActive: true,
        isVerified: true,
      },
      select,
    });
    await prisma.activityLog.create({
      data: { userId: req.user.id, action: "inspector.created", entityType: "User", entityId: user.id },
    }).catch(() => {});

    const email = req.body?.sendEmail === false ? { sent: false, reason: "Not requested" } : await sendWelcome(user, { adminSetPassword: Boolean(out.password) });
    const message = email.sent
      ? `Inspector added. A welcome email was sent to ${user.email}.`
      : `Inspector added.${req.body?.sendEmail === false ? "" : ` ${email.reason} — you can resend it from the list.`}`;
    return ok(res, { inspector: await one(user.id), emailSent: email.sent }, message, 201);
  } catch (error) {
    if (error?.code === "P2002") return fail(res, "Another account already uses this email or mobile number.", 409);
    next(error);
  }
};

export const updateFieldInspector = async (req, res, next) => {
  try {
    const current = await prisma.user.findFirst({ where: { id: req.params.id, role: "INSPECTOR" }, select });
    if (!current) return fail(res, "Field inspector not found", 404);
    const b = req.body || {};
    const { out, errors } = validate(b, { partial: true });
    Object.assign(errors, await conflicts(out, current.id));
    if (Object.keys(errors).length) return badRequest(res, errors);

    const data = { ...out };
    delete data.password;
    if (data.fullName) data.lastName = data.fullName.split(" ").slice(1).join(" ") || null;
    if (out.password) data.password = await bcrypt.hash(out.password, 10);

    if (b.isActive !== undefined) {
      const active = b.isActive === true || b.isActive === "true";
      if (!active && current.isActive) {
        const open = await prisma.inspection.count({ where: { inspectorId: current.id, status: { in: OPEN } } });
        if (open) return fail(res, `This inspector still has ${open} open inspection${open === 1 ? "" : "s"}. Reassign ${open === 1 ? "it" : "them"} first, then deactivate.`, 409);
      }
      data.isActive = active;
      if (active) data.isBlocked = false;
    }

    await prisma.user.update({ where: { id: current.id }, data });
    if (data.isActive === false || out.password) {
      await prisma.authSession.updateMany({ where: { userId: current.id, revokedAt: null }, data: { revokedAt: new Date() } });
    }
    await prisma.activityLog.create({
      data: { userId: req.user.id, action: "inspector.updated", entityType: "User", entityId: current.id, metadata: { fields: Object.keys(data).filter((k) => k !== "password").concat(out.password ? ["password"] : []) } },
    }).catch(() => {});

    const message = data.isActive === false ? "Inspector deactivated — they can no longer sign in."
      : data.isActive === true && !current.isActive ? "Inspector activated."
        : "Inspector updated.";
    return ok(res, await one(current.id), message);
  } catch (error) {
    if (error?.code === "P2002") return fail(res, "Another account already uses this email or mobile number.", 409);
    next(error);
  }
};

export const sendInspectorInvite = async (req, res, next) => {
  try {
    const u = await prisma.user.findFirst({ where: { id: req.params.id, role: "INSPECTOR" }, select });
    if (!u) return fail(res, "Field inspector not found", 404);
    if (!u.isActive) return fail(res, "Activate this inspector before sending the sign-in email.", 409);
    const r = await sendWelcome(u, { adminSetPassword: Boolean(u.password) });
    if (!r.sent) return fail(res, `${r.reason}. Please try again later.`, 503);
    return ok(res, null, `Sign-in details sent to ${u.email}.`);
  } catch (error) {
    next(error);
  }
};