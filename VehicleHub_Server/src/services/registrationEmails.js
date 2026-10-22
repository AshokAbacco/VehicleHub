// VehicleHub/VehicleHub_Server/src/services/registrationEmails.js
// After a Seller/Dealer registration is saved, two emails go out through Microsoft 365
// (the existing MS_* settings, sent from MS_SMTP_USER):
//   1. Welcome email   -> the client's registered email
//   2. Admin email     -> MS_SMTP_USER (approval required)
// Passwords are never included — only "use the password you created".
// Sending runs in the background and never throws, so an email problem can't fail the
// registration or create a duplicate; failures are logged.
//
// Login link = CORS_ORIGIN (the frontend URL in the backend .env) + "/login".
import { prisma } from "../config/db.js";
import { sendMail, senderAddress } from "./msMailer.js";
import { COMPANY } from "./invoicePdf.js";
import { emailLayout, escapeHtml, supportContacts } from "./emailLayout.js";


/** Frontend login page from CORS_ORIGIN (first entry if several; ignored if it's "*" or empty). */
export const loginUrl = () => {
  const first = String(process.env.CORS_ORIGIN || "")
    .split(",")
    .map((s) => s.trim().replace(/^["']|["']$/g, ""))
    .find((s) => /^https?:\/\//i.test(s));
  return first ? `${first.replace(/\/+$/, "")}/login` : null;
};

const dateIN = (d) =>
  new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "long", year: "numeric" }).format(new Date(d));
const rupees = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const durationText = (m) => (Number(m) === 12 ? "12 months (Yearly)" : Number(m) === 1 ? "1 month" : `${m} months`);
const locationText = (l) => (l === "RURAL" ? "Rural" : "Urban");
const planName = (pay) => (pay ? `Premium (${locationText(pay.locationCategory)}, ${durationText(pay.durationMonths)})` : "No plan purchased yet");

const table = (rows) => `
  <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;margin:6px 0 18px">
    ${rows
      .map(
        ([k, v]) => `
    <tr>
      <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;background:#f8fafc;color:#64748b;font-size:13px;width:42%">${k}</td>
      <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:13px;font-weight:bold">${v}</td>
    </tr>`,
      )
      .join("")}
  </table>`;

const heading = (text) => `<h3 style="margin:22px 0 6px;color:#001f3f;font-size:15px">${text}</h3>`;

const layout = (subtitle, inner, internal = false) => emailLayout({ subtitle, body: inner, internal, width: 620 });

const loginLink = (url) =>
  url ? `<a href="${escapeHtml(url)}" style="color:#1d4ed8">${escapeHtml(url)}</a>` : "the Login page on the MotorDesk website";

// ---------- 1. Welcome email (client) ----------
const welcomeHtml = (r) =>
  layout(
    "Registration successful",
    `
    <p style="margin:0 0 12px">Dear ${escapeHtml(r.fullName)},</p>
    <p style="margin:0 0 6px"><strong>Welcome to ${COMPANY.name}!</strong></p>
    <p style="margin:0 0 6px">Thank you for registering with ${COMPANY.name}. Your registration has been completed successfully.</p>

    ${heading("Your Registration Details")}
    ${table([
      ["Company", COMPANY.name],
      ["Shop Name", escapeHtml(r.shopName)],
      ["Full Name", escapeHtml(r.fullName)],
      ["Email", escapeHtml(r.email)],
      ["Phone", escapeHtml(r.phone || "—")],
      ["Selected Plan", escapeHtml(planName(r.payment))],
      ["Registration Date", dateIN(r.registeredAt)],
      ["Registration Status", '<span style="color:#b45309">Pending Admin Approval</span>'],
    ])}

    ${heading("Your Login Details")}
    ${table([
      ["Login URL", loginLink(r.loginUrl)],
      ["Email / Phone", `${escapeHtml(r.email)}${r.phone ? ` or ${escapeHtml(r.phone)}` : ""}`],
      ["Password", "Use the password you created during registration."],
    ])}
    <p style="margin:-8px 0 16px;color:#64748b;font-size:12px">
      For your security we never send passwords by email. If you forget your password, contact our support team below and we'll help you reset it.
    </p>

    <div style="margin:4px 0 18px;padding:14px 16px;background:#fffbeb;border:1px solid #fde68a;border-radius:10px">
      <p style="margin:0 0 6px;color:#92400e;font-weight:bold">Important: Seller/Dealer Account Approval Required</p>
      <p style="margin:0 0 6px;color:#78350f;font-size:13px">Your Seller/Dealer account is currently awaiting Admin approval.</p>
      <p style="margin:0 0 6px;color:#78350f;font-size:13px">Until your account is approved, you will not have access to the Seller/Dealer dashboard or its selling features. In the meantime, you can use the application as a Buyer.</p>
      <p style="margin:0;color:#78350f;font-size:13px">Our Admin team will review your registration and aims to approve your account within 24 hours.</p>
    </div>

    <p style="margin:0 0 6px">If you have not received approval within 24 hours, please contact our support team:</p>
    <p style="margin:0 0 16px">${supportContacts()}</p>

    <p style="margin:0 0 16px">Thank you for choosing ${COMPANY.name}. We look forward to helping you grow your business!</p>
    <p style="margin:0">Best regards,<br><strong>${COMPANY.name} Support Team</strong></p>`,
  );

// ---------- 2. Admin notification (MS_SMTP_USER) ----------
const adminHtml = (r) => {
  const pay = r.payment;
  return layout(
    "New Seller/Dealer registration – approval required",
    `
    <p style="margin:0 0 12px">Dear Admin,</p>
    <p style="margin:0 0 6px">A new Seller/Dealer has successfully registered on ${COMPANY.name}.</p>
    <p style="margin:0 0 6px">Please review the client's registration, payment, and subscription details.</p>

    ${heading("Client Registration Details")}
    ${table([
      ["Shop Name", escapeHtml(r.shopName)],
      ["Full Name", escapeHtml(r.fullName)],
      ["Account Type Requested", escapeHtml(r.accountType)],
      ["Email Address", escapeHtml(r.email)],
      ["Phone Number", escapeHtml(r.phone || "—")],
      ["Registration Date", dateIN(r.registeredAt)],
      ["Registration Status", '<span style="color:#b45309">Pending Approval</span>'],
      ...(r.resubmitted ? [["Note", "Resubmitted after an earlier rejection"]] : []),
    ])}

    ${heading("Client Login Details")}
    ${table([
      ["Login Page URL", loginLink(r.loginUrl)],
      ["Registered Email", escapeHtml(r.email)],
      ["Registered Phone", escapeHtml(r.phone || "—")],
    ])}

    ${heading("Payment and Subscription Details")}
    ${pay
      ? table([
          ["Selected Plan", "Premium"],
          ["Subscription Duration", durationText(pay.durationMonths)],
          ["Location Category", locationText(pay.locationCategory)],
          ["Amount Paid", rupees(pay.amount)],
          ["Payment Status", pay.status === "SUCCESS" ? '<span style="color:#047857">Successful (verified)</span>' : escapeHtml(pay.status)],
          ["Razorpay Payment ID", escapeHtml(pay.razorpayPaymentId)],
          ...(pay.invoiceNumber ? [["Invoice Number", escapeHtml(pay.invoiceNumber)]] : []),
        ])
      : table([["Selected Plan", "No plan purchased yet"], ["Payment", "No plan payment is linked to this registration"]])}

    <div style="margin:4px 0 18px;padding:14px 16px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;color:#1e3a8a;font-size:13px">
      <p style="margin:0 0 6px"><strong>Action Required:</strong> Please approve this client as a Seller/Dealer so they can access the Seller/Dealer dashboard and start selling vehicles.</p>
      <p style="margin:0 0 6px">Until the account is approved, the client must not have access to Seller/Dealer dashboard features.</p>
      <p style="margin:0">Please ensure that the client's account role and permissions are updated correctly after approval (Admin dashboard → Sellers).</p>
    </div>

    <p style="margin:0">Best regards,<br><strong>${COMPANY.name} System</strong></p>`,
    true, // to our own team — no MotorDesk contact details in the footer
  );
};

/**
 * Sends both emails for a saved registration. Never throws.
 * @param {{ sellerProfileId: string, userId: string, resubmitted?: boolean }} info
 */
export const sendRegistrationEmails = async ({ sellerProfileId, userId, resubmitted = false }) => {
  let r;
  try {
    const [profile, user, payment] = await Promise.all([
      prisma.sellerProfile.findUnique({ where: { id: sellerProfileId } }),
      prisma.user.findUnique({ where: { id: userId }, select: { email: true, phone: true, fullName: true } }),
      prisma.subscriptionPayment.findFirst({ where: { sellerProfileId, status: "SUCCESS" }, orderBy: { paidAt: "desc" } }),
    ]);
    if (!profile || !user) return;
    r = {
      shopName: profile.businessName || profile.ownerName,
      fullName: profile.ownerName || user.fullName || "there",
      email: user.email, // the email they sign in with
      phone: user.phone || null,
      accountType: profile.sellerType === "DEALER" ? "Dealer (shop)" : "Seller (individual)",
      registeredAt: profile.submittedAt || new Date(),
      payment,
      resubmitted,
      loginUrl: loginUrl(),
    };
  } catch (err) {
    console.error("Registration emails: could not load the registration:", err?.message);
    return;
  }
  if (!r.loginUrl) console.warn("Registration emails: CORS_ORIGIN is not a frontend URL, so the login link is left out");

  const results = await Promise.allSettled([
    sendMail({
      to: { name: r.fullName, address: r.email },
      subject: `Welcome to ${COMPANY.name} – Registration Successful!`,
      html: welcomeHtml(r),
    }),
    sendMail({
      to: senderAddress(),
      replyTo: { name: r.fullName, address: r.email },
      subject: "New Seller/Dealer Registration – Approval Required",
      html: adminHtml(r),
    }),
  ]);
  const [welcome, admin] = results;
  if (welcome.status === "fulfilled") console.log(`Registration welcome email sent to ${r.email}`);
  else console.error(`Registration welcome email FAILED for ${r.email}:`, welcome.reason?.code || "", welcome.reason?.message);
  if (admin.status === "fulfilled") console.log(`Registration admin notification sent for ${r.email}`);
  else console.error(`Registration admin email FAILED for ${r.email}:`, admin.reason?.code || "", admin.reason?.message);
};

/** Fire-and-forget: the registration response never waits for the emails. */
export const queueRegistrationEmails = (info) => {
  setImmediate(() => {
    sendRegistrationEmails(info).catch((e) => console.error("Registration emails:", e?.message));
  });
};