// VehicleHub/VehicleHub_Server/src/services/invoiceEmail.js
// Emails the PDF invoice for a VERIFIED plan payment (SubscriptionPayment rows only exist after
// the backend has confirmed the payment with Razorpay, so failed / cancelled / pending payments
// never reach this code).
//
// One email per payment:
//   - a row is "claimed" atomically (PENDING/FAILED -> SENDING) before sending, so two callers
//     (browser verify + Razorpay webhook, or two retries) can never both send it
//   - SENT rows are never sent again
//   - failures are stored on the row (invoiceEmailError, attempts) and logged, then retried
//     automatically by retryPendingInvoices() — up to MAX_ATTEMPTS, with a pause between tries
// Sending never throws and never blocks the payment / seller registration flow.
import { prisma } from "../config/db.js";
import { sendMail } from "./msMailer.js";
import { buildInvoicePdf, COMPANY, money, durationText, locationText, planText } from "./invoicePdf.js";
import { emailLayout } from "./emailLayout.js";

const MAX_ATTEMPTS = 5;
const RETRY_AFTER_MS = 10 * 60 * 1000; // wait 10 min between tries
const STUCK_SENDING_MS = 10 * 60 * 1000; // a SENDING claim older than this is treated as failed

export const invoiceNumberFor = (seq) => `MD-INV-${String(seq).padStart(6, "0")}`;

const escapeHtml = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const rupees = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const dateIN = (d) => new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "long", year: "numeric" }).format(new Date(d));

const invoiceEmailHtml = (p) => {
  const row = (label, value) => `
      <tr>
        <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;width:44%">${label}</td>
        <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:13px;font-weight:bold">${value}</td>
      </tr>`;
  return emailLayout({
    subtitle: "Payment receipt & invoice",
    body: `
      <p style="margin:0 0 14px;color:#0f172a;font-size:15px">Hello ${escapeHtml(p.fullName)},</p>
      <div style="margin:0 0 18px;padding:12px 14px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:10px;color:#065f46;font-size:14px">
        <strong>Payment successful.</strong> We have received your payment of <strong>${rupees(p.amount)}</strong> for the
        ${escapeHtml(planText(p.plan))} plan.
      </div>
      <p style="margin:0 0 16px;color:#334155;font-size:14px;line-height:1.6">
        Your invoice is attached to this email as a PDF. Here is a summary:
      </p>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:10px">
        ${row("Invoice number", escapeHtml(p.invoiceNumber))}
        ${row("Invoice date", dateIN(p.paidAt))}
        ${row("Shop name", escapeHtml(p.shopName))}
        ${row("Plan", `${escapeHtml(planText(p.plan))}`)}
        ${row("Location", locationText(p.locationCategory))}
        ${row("Duration", durationText(p.durationMonths))}
        ${row("Amount paid", rupees(p.amount))}
        ${row("Payment ID", escapeHtml(p.razorpayPaymentId))}
      </table>
      <p style="margin:22px 0 6px;color:#334155;font-size:14px;line-height:1.6">
        Thank you for choosing ${COMPANY.name}. If you haven't finished your seller registration yet, you can complete it on our website.
      </p>
      <p style="margin:18px 0 0;color:#334155;font-size:14px">Best regards,<br><strong>${COMPANY.name} Team</strong></p>
      <p style="margin:18px 0 0;color:#64748b;font-size:12px">Questions about this invoice? Just reply to this email.</p>`,
  });
};

/**
 * Sends the invoice for one payment if it hasn't been sent yet. Never throws.
 * @returns {Promise<"sent"|"skipped"|"failed">}
 */
export const sendInvoiceForPayment = async (paymentId) => {
  const now = new Date();
  let claimed;
  try {
    // Atomic claim — only one caller can move the row to SENDING
    claimed = await prisma.subscriptionPayment.updateMany({
      where: {
        id: paymentId,
        status: "SUCCESS",
        invoiceEmailAttempts: { lt: MAX_ATTEMPTS },
        OR: [
          { invoiceEmailStatus: { in: ["PENDING", "FAILED"] } },
          { invoiceEmailStatus: "SENDING", invoiceEmailLastTriedAt: { lt: new Date(now.getTime() - STUCK_SENDING_MS) } },
        ],
      },
      data: { invoiceEmailStatus: "SENDING", invoiceEmailAttempts: { increment: 1 }, invoiceEmailLastTriedAt: now },
    });
  } catch (err) {
    console.error(`Invoice email: could not claim payment ${paymentId}:`, err?.message);
    return "failed";
  }
  if (!claimed.count) return "skipped"; // already sent, being sent, or out of attempts

  let p;
  try {
    p = await prisma.subscriptionPayment.findUnique({ where: { id: paymentId } });
    if (!p.invoiceNumber) {
      p = await prisma.subscriptionPayment.update({
        where: { id: paymentId },
        data: { invoiceNumber: invoiceNumberFor(p.invoiceSeq) },
      });
    }

    const pdf = await buildInvoicePdf(p);
    await sendMail({
      to: { name: p.fullName, address: p.email },
      subject: `Your ${COMPANY.name} invoice ${p.invoiceNumber} – payment received`,
      html: invoiceEmailHtml(p),
      attachments: [{ filename: `${p.invoiceNumber}.pdf`, content: pdf, contentType: "application/pdf" }],
    });

    await prisma.subscriptionPayment.update({
      where: { id: paymentId },
      data: { invoiceEmailStatus: "SENT", invoiceSentAt: new Date(), invoiceEmailError: null },
    });
    console.log(`Invoice ${p.invoiceNumber} emailed to ${p.email}`);
    return "sent";
  } catch (err) {
    const reason = `${err?.code ? `[${err.code}] ` : ""}${err?.message || err}`.slice(0, 500);
    console.error(`Invoice email FAILED for payment ${paymentId}${p?.invoiceNumber ? ` (${p.invoiceNumber})` : ""}: ${reason} — will retry automatically`);
    await prisma.subscriptionPayment
      .update({ where: { id: paymentId }, data: { invoiceEmailStatus: "FAILED", invoiceEmailError: reason } })
      .catch((e) => console.error("Invoice email: could not record the failure:", e?.message));
    return "failed";
  }
};

/** Fire-and-forget after a payment is verified — the caller never waits for the email. */
export const queueInvoiceEmail = (paymentId) => {
  setImmediate(() => {
    sendInvoiceForPayment(paymentId).catch((e) => console.error("Invoice email:", e?.message));
  });
};

/** Re-sends invoices that failed (or were never sent). Safe to run any time — runs on a timer. */
export const retryPendingInvoices = async () => {
  try {
    const cutoff = new Date(Date.now() - RETRY_AFTER_MS);
    const due = await prisma.subscriptionPayment.findMany({
      where: {
        status: "SUCCESS",
        invoiceEmailAttempts: { lt: MAX_ATTEMPTS },
        OR: [
          { invoiceEmailStatus: "FAILED", invoiceEmailLastTriedAt: { lt: cutoff } },
          { invoiceEmailStatus: "PENDING", createdAt: { lt: new Date(Date.now() - 60 * 1000) } },
          { invoiceEmailStatus: "SENDING", invoiceEmailLastTriedAt: { lt: new Date(Date.now() - STUCK_SENDING_MS) } },
        ],
      },
      select: { id: true },
      orderBy: { createdAt: "asc" },
      take: 25,
    });
    for (const { id } of due) await sendInvoiceForPayment(id);
    if (due.length) console.log(`Invoice retry: processed ${due.length} pending invoice email(s)`);
  } catch (err) {
    console.error("Invoice retry failed:", err?.message);
  }
};

let retryTimer = null;
/** Starts the background retry (called once from server.js). */
export const startInvoiceRetryLoop = ({ everyMs = 15 * 60 * 1000, firstAfterMs = 30 * 1000 } = {}) => {
  if (retryTimer) return;
  setTimeout(retryPendingInvoices, firstAfterMs).unref?.();
  retryTimer = setInterval(retryPendingInvoices, everyMs);
  retryTimer.unref?.();
};