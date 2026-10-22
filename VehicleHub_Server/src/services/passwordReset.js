// VehicleHub/VehicleHub_Server/src/services/passwordReset.js
// ============================================================
// Forgot password with an email OTP (sent from MS_SMTP_USER through Microsoft 365 — the
// existing MS_* settings in the backend .env; no new settings).
//
//   1. requestReset(identifier)        email or mobile -> 6-digit code to the account's email
//   2. verifyCode(identifier, otp)     correct code    -> short-lived reset token (15 min)
//   3. resetPassword(token, password)  token           -> new password saved, code used up
//
// Security:
//  - the code is stored only as a bcrypt hash (OTP table), valid 10 minutes, one active code
//    per account; 5 wrong tries cancel the code
//  - a new code can be requested once a minute and at most 5 times an hour
//  - the reset token is signed with a separate key (JWT_SECRET + purpose), so it can never be
//    used as a sign-in token, and works once (the code record is deleted on reset)
//  - passwords are never emailed or logged
// ============================================================
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";
import { jwtSecret } from "../config/jwt.js";
import { generateOTP, hashOTP, compareOTP } from "../utils/otp.js";
import { normalizePhone } from "../utils/phone.js";
import { sendMail, missingMailSettings } from "./msMailer.js";
import { COMPANY } from "./invoicePdf.js";
import { loginUrl } from "./registrationEmails.js";
import { emailLayout, escapeHtml, supportContacts } from "./emailLayout.js";

export const OTP_MINUTES = 10;
export const RESEND_SECONDS = 60;
const MAX_ATTEMPTS = 5;
const MAX_CODES_PER_HOUR = 5;
const TOKEN_MINUTES = 15;
export const PASSWORD_MIN = 6;
const PASSWORD_MAX = 72;

const RESET_SECRET = `${jwtSecret}:password-reset`;
const httpError = (message, statusCode = 400, extra = {}) => Object.assign(new Error(message), { statusCode, ...extra });
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/** "ashok@gmail.com" -> "as***@gmail.com" */
export const maskEmail = (email) => {
  const [name, domain] = String(email || "").split("@");
  if (!domain) return "";
  return `${name.slice(0, Math.min(2, name.length))}${"*".repeat(Math.max(3, name.length - 2))}@${domain}`;
};

const findUser = async (identifier) => {
  const id = String(identifier || "").trim();
  if (!id) return null;
  if (isEmail(id)) return prisma.user.findFirst({ where: { email: { equals: id.toLowerCase(), mode: "insensitive" } } });
  const phone = normalizePhone(id);
  return phone ? prisma.user.findFirst({ where: { phone } }) : null;
};

const otpEmail = (user, code) =>
  emailLayout({
    subtitle: "Password reset code",
    width: 560,
    body: `
    <p style="margin:0 0 12px">Dear ${escapeHtml(user.fullName || "Customer")},</p>
    <p style="margin:0 0 16px">We received a request to reset the password of your ${COMPANY.name} account. Use this code to continue:</p>
    <div style="margin:0 0 16px;text-align:center">
      <span style="display:inline-block;padding:14px 26px;border-radius:12px;background:#e6f2ff;color:#001f3f;font-size:30px;font-weight:bold;letter-spacing:10px">${code}</span>
    </div>
    <p style="margin:0 0 8px">The code is valid for <strong>${OTP_MINUTES} minutes</strong> and can be used once.</p>
    <p style="margin:0 0 8px;color:#b91c1c"><strong>Never share this code with anyone</strong> — ${COMPANY.name} staff will never ask for it.</p>
    <p style="margin:0;color:#64748b">If you didn't ask to reset your password, you can ignore this email; your password stays the same.</p>`,
  });

const changedEmail = (user) => {
  const url = loginUrl();
  return emailLayout({
    subtitle: "Password changed",
    width: 560,
    body: `
    <p style="margin:0 0 12px">Dear ${escapeHtml(user.fullName || "Customer")},</p>
    <p style="margin:0 0 12px">The password of your ${COMPANY.name} account was changed on
      ${new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "long", timeStyle: "short" }).format(new Date())} (IST).</p>
    ${url ? `<p style="margin:0 0 12px">You can sign in with your new password here: <a href="${escapeHtml(url)}" style="color:#1d4ed8">${escapeHtml(url)}</a></p>` : ""}
    <p style="margin:0;color:#b91c1c">If you didn't make this change, contact us right away at ${supportContacts("#b91c1c")}.</p>`,
  });
};

/**
 * Step 1 — sends a code to the account's email.
 * Returns { sent, sentTo, resendIn }. sent=false (with the same generic message) when no account matches.
 */
export const requestReset = async (identifier) => {
  const user = await findUser(identifier);
  if (!user || !user.email || user.isBlocked) return { sent: false };

  const missing = missingMailSettings();
  if (missing.length) {
    console.error("Password reset email not configured. Missing:", missing.join(", "));
    throw httpError("Password reset emails can't be sent right now. Please contact support.", 503);
  }

  const now = Date.now();
  const recent = await prisma.oTP.findMany({
    where: { email: user.email, createdAt: { gte: new Date(now - 60 * 60 * 1000) } },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  if (recent[0] && now - recent[0].createdAt.getTime() < RESEND_SECONDS * 1000) {
    const wait = Math.ceil((RESEND_SECONDS * 1000 - (now - recent[0].createdAt.getTime())) / 1000);
    throw httpError(`Please wait ${wait} seconds before requesting a new code.`, 429, { data: { resendIn: wait } });
  }
  if (recent.length >= MAX_CODES_PER_HOUR) {
    throw httpError("Too many codes requested. Please try again in an hour.", 429);
  }

  const code = generateOTP();
  // one active code per account: older codes stop working
  await prisma.oTP.updateMany({ where: { email: user.email, expiresAt: { gt: new Date(now) } }, data: { expiresAt: new Date(now) } });
  await prisma.oTP.deleteMany({ where: { createdAt: { lt: new Date(now - 24 * 60 * 60 * 1000) } } }); // tidy up
  const record = await prisma.oTP.create({
    data: {
      email: user.email,
      mobile: user.phone || "",
      otp: await hashOTP(code),
      expiresAt: new Date(now + OTP_MINUTES * 60 * 1000),
    },
  });

  try {
    await sendMail({ to: user.email, subject: `${code} is your ${COMPANY.name} password reset code`, html: otpEmail(user, code) });
  } catch (err) {
    await prisma.oTP.delete({ where: { id: record.id } }).catch(() => {});
    console.error("Password reset email failed:", err?.message);
    throw httpError("We couldn't send the email right now. Please try again in a few minutes.", 503);
  }
  return { sent: true, sentTo: maskEmail(user.email), resendIn: RESEND_SECONDS, expiresInMinutes: OTP_MINUTES };
};

/** Step 2 — checks the code; returns { resetToken }. */
export const verifyCode = async (identifier, otp) => {
  const code = String(otp || "").replace(/\D/g, "");
  if (!/^\d{4,8}$/.test(code)) throw httpError("Enter the 6-digit code from the email.");
  const invalid = () => httpError("The code is incorrect or has expired. Please request a new code.");

  const user = await findUser(identifier);
  if (!user?.email || user.isBlocked) throw invalid();
  const record = await prisma.oTP.findFirst({
    where: { email: user.email, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!record) throw invalid();
  if (record.attempts >= MAX_ATTEMPTS) throw httpError("Too many wrong attempts. Please request a new code.");

  if (!(await compareOTP(code, record.otp))) {
    const updated = await prisma.oTP.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
    const left = MAX_ATTEMPTS - updated.attempts;
    if (left <= 0) {
      await prisma.oTP.update({ where: { id: record.id }, data: { expiresAt: new Date() } });
      throw httpError("Too many wrong attempts. Please request a new code.");
    }
    throw httpError(`Incorrect code. ${left} attempt${left === 1 ? "" : "s"} left.`);
  }

  // The verified code stays valid for the reset step (token lifetime), then is deleted on use
  await prisma.oTP.update({
    where: { id: record.id },
    data: { verified: true, expiresAt: new Date(Date.now() + TOKEN_MINUTES * 60 * 1000) },
  });
  const resetToken = jwt.sign({ sub: user.id, otp: record.id, purpose: "password-reset" }, RESET_SECRET, { expiresIn: `${TOKEN_MINUTES}m` });
  return { resetToken, expiresInMinutes: TOKEN_MINUTES };
};

/** Step 3 — saves the new password. */
export const resetPassword = async (resetToken, password, confirmPassword) => {
  let payload;
  try {
    payload = jwt.verify(String(resetToken || ""), RESET_SECRET);
  } catch {
    throw httpError("This reset session has expired. Please start again.", 400);
  }
  if (payload?.purpose !== "password-reset") throw httpError("This reset session is not valid. Please start again.");

  const pwd = String(password || "");
  if (pwd.length < PASSWORD_MIN) throw httpError(`Password must be at least ${PASSWORD_MIN} characters.`);
  if (pwd.length > PASSWORD_MAX) throw httpError(`Password must be at most ${PASSWORD_MAX} characters.`);
  if (confirmPassword !== undefined && pwd !== String(confirmPassword)) throw httpError("The passwords don't match.");

  const [user, record] = await Promise.all([
    prisma.user.findUnique({ where: { id: payload.sub } }),
    prisma.oTP.findUnique({ where: { id: payload.otp } }),
  ]);
  if (!user || user.isBlocked || !record?.verified || record.email !== user.email || record.expiresAt < new Date()) {
    throw httpError("This reset session has expired or was already used. Please start again.");
  }
  if (user.password && (await bcrypt.compare(pwd, user.password))) {
    throw httpError("The new password must be different from your current password.");
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { password: await bcrypt.hash(pwd, 10) } }),
    prisma.oTP.deleteMany({ where: { email: user.email } }), // used up — every code for this account
    prisma.authSession.updateMany({ where: { userId: user.id }, data: { revokedAt: new Date() } }),
    prisma.activityLog.create({ data: { userId: user.id, action: "auth.password_reset", entityType: "User", entityId: user.id } }),
  ]);

  // Confirmation email in the background — a mail problem must not undo the reset
  setImmediate(() => {
    sendMail({ to: user.email, subject: `Your ${COMPANY.name} password was changed`, html: changedEmail(user) })
      .catch((err) => console.error("Password changed email failed:", err?.message));
  });
  return { email: maskEmail(user.email) };
};