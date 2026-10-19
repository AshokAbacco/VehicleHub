// VehicleHub/VehicleHub_Server/src/controllers/contactUs.controller.js
// ============================================================
// Contact Us page + footer "Raise a Ticket" — both send email through Microsoft 365
// (Microsoft Graph API, app sign-in). No SMTP. Nothing is stored in the database.
//
//   POST /api/contact-us          Contact Us form
//        -> enquiry to support@themotordesk.com
//        -> acknowledgement to the customer ("we'll get back to you within 24 hours")
//   POST /api/contact-us/ticket   Footer "Raise a Ticket"
//        -> ticket to info@abaccotech.com
//
// Backend .env (the same Microsoft 365 settings used before):
//   MS_TENANT_ID=      Directory (tenant) ID of the Entra app registration
//   MS_CLIENT_ID=      Application (client) ID
//   MS_CLIENT_SECRET=  Client secret VALUE (not the secret ID)
//   MS_SMTP_USER=      Mailbox the mail is sent from: support@themotordesk.com
// The app needs the Microsoft Graph *Application* permission "Mail.Send" (admin consent),
// and MS_SMTP_USER must be a licensed Exchange Online mailbox.
// Optional: CONTACT_TO_EMAIL, TICKET_TO_EMAIL to change the recipients below.
// ============================================================

const env = (...names) => names.map((n) => process.env[n]).find((v) => v !== undefined && String(v).trim() !== "")?.trim();

const CONTACT_TO = env("CONTACT_TO_EMAIL") || "support@themotordesk.com";
const TICKET_TO = env("TICKET_TO_EMAIL") || "info@abaccotech.com";
const BRAND = "MotorDesk VehicleHub"; // used in the acknowledgement email to the customer

// ---------- Microsoft 365 (Graph) mail ----------
const ms = () => ({
  tenant: env("MS_TENANT_ID"),
  clientId: env("MS_CLIENT_ID"),
  secret: env("MS_CLIENT_SECRET"),
  sender: env("MS_SMTP_USER"),
});
const missingMailSettings = () =>
  Object.entries({ MS_TENANT_ID: ms().tenant, MS_CLIENT_ID: ms().clientId, MS_CLIENT_SECRET: ms().secret, MS_SMTP_USER: ms().sender })
    .filter(([, v]) => !v)
    .map(([k]) => k);

class MailError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

let tokenCache = { token: null, expiresAt: 0 };

const getAccessToken = async () => {
  if (tokenCache.token && Date.now() < tokenCache.expiresAt - 60_000) return tokenCache.token;
  const { tenant, clientId, secret } = ms();
  const res = await fetch(`https://login.microsoftonline.com/${encodeURIComponent(tenant)}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: secret,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials",
    }),
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    // e.g. AADSTS7000215 = wrong client secret, AADSTS700016 = app not found in the tenant
    const msg = String(data.error_description || data.error || `HTTP ${res.status}`).split("\r\n")[0];
    throw new MailError(`Microsoft sign-in failed: ${msg}`, data.error || "token_error");
  }
  tokenCache = { token: data.access_token, expiresAt: Date.now() + Number(data.expires_in || 3600) * 1000 };
  return tokenCache.token;
};

const recipient = (value) =>
  typeof value === "object"
    ? { emailAddress: { address: value.address, ...(value.name ? { name: value.name } : {}) } }
    : { emailAddress: { address: value } };

/** Sends one email as MS_SMTP_USER. to / replyTo: "a@b.com" or { name, address }. */
const sendMail = async ({ to, replyTo, subject, html }) => {
  const token = await getAccessToken();
  const res = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(ms().sender)}/sendMail`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: {
        subject,
        body: { contentType: "HTML", content: html },
        toRecipients: [recipient(to)],
        ...(replyTo ? { replyTo: [recipient(replyTo)] } : {}),
      },
      saveToSentItems: true,
    }),
    signal: AbortSignal.timeout(20000),
  });
  if (res.status !== 202 && !res.ok) {
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) tokenCache = { token: null, expiresAt: 0 };
    // e.g. ErrorAccessDenied = Mail.Send not granted, MailboxNotEnabledForRESTAPI = no Exchange mailbox
    throw new MailError(`Microsoft Graph sendMail failed (${res.status}): ${data?.error?.message || res.statusText}`, data?.error?.code || `http_${res.status}`);
  }
};

// ---------- validation ----------
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean = (v) => String(v ?? "").trim();

const validate = (body = {}) => {
  const name = clean(body.name).replace(/\s+/g, " ");
  const email = clean(body.email).toLowerCase();
  const message = clean(body.message);
  const errors = {};
  if (!name) errors.name = "Please enter your name.";
  else if (name.length < 2 || name.length > 100) errors.name = "Name must be between 2 and 100 characters.";
  if (!email) errors.email = "Please enter your email address.";
  else if (!EMAIL_RE.test(email) || email.length > 254) errors.email = "Please enter a valid email address.";
  if (!message) errors.message = "Please enter your message.";
  else if (message.length < 10) errors.message = "Please write at least 10 characters.";
  else if (message.length > 5000) errors.message = "Message is too long (maximum 5000 characters).";
  return { name, email, message, errors };
};

// Hidden "website" field on the forms: people leave it empty, spam bots fill it in
const isBot = (body = {}) => clean(body.website) !== "";

// ---------- email content ----------
const escapeHtml = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const nl2br = (s) => escapeHtml(s).replace(/\r?\n/g, "<br>");

const submittedAt = () =>
  new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "long", timeStyle: "short" }).format(new Date()) + " IST";

const layout = (title, inner) => `
<div style="font-family:Arial,Helvetica,sans-serif;background:#f5f7fb;padding:32px 16px">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0">
    <div style="background:#001f3f;color:#ffffff;padding:18px 24px;font-size:18px;font-weight:bold">${escapeHtml(title)}</div>
    <div style="padding:24px;color:#1e293b;font-size:14px;line-height:1.6">${inner}</div>
  </div>
</div>`;

const detailsTable = (rows) => `
<table style="width:100%;border-collapse:collapse">
  ${rows
    .map(
      ([label, value]) => `
  <tr>
    <td style="padding:8px 10px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:bold;width:140px;vertical-align:top">${escapeHtml(label)}</td>
    <td style="padding:8px 10px;border:1px solid #e2e8f0">${value}</td>
  </tr>`,
    )
    .join("")}
</table>`;

const submissionEmail = ({ heading, intro, name, email, message, when }) => ({
  html: layout(
    heading,
    `<p style="margin:0 0 16px">${escapeHtml(intro)}</p>
     ${detailsTable([
       ["Name", escapeHtml(name)],
       ["Email", `<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>`],
       ["Submitted on", escapeHtml(when)],
       ["Message", nl2br(message)],
     ])}
     <p style="margin:16px 0 0;color:#64748b;font-size:12px">Reply to this email to respond to the customer directly.</p>`,
  ),
  text: `${heading}\n\n${intro}\n\nName: ${name}\nEmail: ${email}\nSubmitted on: ${when}\n\nMessage:\n${message}\n`,
});

const acknowledgementEmail = (name) => {
  const text = [
    `Hello ${name},`,
    "",
    `Thank you for contacting ${BRAND}. We have received your enquiry and will review your message.`,
    "Our team will get back to you within 24 hours.",
    "",
    "Thank you for your patience.",
    "",
    "Best regards,",
    `${BRAND} Support Team`,
  ].join("\n");
  return {
    subject: `We Have Received Your Enquiry – ${BRAND}`,
    text,
    html: layout(
      `${BRAND} Support`,
      `<p style="margin:0 0 12px">Hello ${escapeHtml(name)},</p>
       <p style="margin:0 0 12px">Thank you for contacting ${BRAND}. We have received your enquiry and will review your message.</p>
       <p style="margin:0 0 12px">Our team will get back to you within <strong>24 hours</strong>.</p>
       <p style="margin:0 0 20px">Thank you for your patience.</p>
       <p style="margin:0">Best regards,<br><strong>${BRAND} Support Team</strong></p>`,
    ),
  };
};

// ---------- shared request handling ----------
const badRequest = (res, errors) =>
  res.status(400).json({ success: false, message: Object.values(errors)[0] || "Please check the form.", errors });

const mailUnavailable = (res) =>
  res.status(503).json({ success: false, message: "We couldn't send your message right now. Please try again later or email us directly." });

const mailFailed = (res, err, what) => {
  console.error(`${what} email failed:`, err?.code || "", err?.message);
  return res.status(502).json({
    success: false,
    message: "We couldn't send your message right now. Please try again in a few minutes or email us directly.",
  });
};

// ============================================================
// POST /api/contact-us — Contact Us page
// ============================================================
export const submitContactForm = async (req, res) => {
  if (isBot(req.body)) return res.status(200).json({ success: true, message: "Thank you! Your enquiry has been sent." });

  const { name, email, message, errors } = validate(req.body);
  if (Object.keys(errors).length) return badRequest(res, errors);

  const missing = missingMailSettings();
  if (missing.length) {
    console.error(`Contact Us: Microsoft 365 email is not configured — add ${missing.join(", ")} to .env`);
    return mailUnavailable(res);
  }

  const when = submittedAt();
  const enquiry = submissionEmail({
    heading: "New Contact Us enquiry",
    intro: "A customer has sent an enquiry from the Contact Us page.",
    name,
    email,
    message,
    when,
  });

  // 1) The enquiry to the support team — this must succeed
  try {
    await sendMail({
      to: CONTACT_TO,
      replyTo: { name, address: email },
      subject: `New enquiry from ${name} – ${BRAND}`,
      html: enquiry.html,
    });
  } catch (err) {
    return mailFailed(res, err, "Contact enquiry");
  }

  // 2) Automatic acknowledgement to the customer — the enquiry is already with the team,
  //    so a failure here is logged but doesn't fail the request
  let acknowledgementSent = true;
  try {
    const ack = acknowledgementEmail(name);
    await sendMail({ to: { name, address: email }, subject: ack.subject, html: ack.html });
  } catch (err) {
    acknowledgementSent = false;
    console.error("Contact acknowledgement email failed:", err?.code || "", err?.message);
  }

  return res.status(200).json({
    success: true,
    message: acknowledgementSent
      ? "Thank you! Your enquiry has been sent. We've emailed you a confirmation and will get back to you within 24 hours."
      : "Thank you! Your enquiry has been sent. Our team will get back to you within 24 hours.",
    acknowledgementSent,
  });
};

// ============================================================
// POST /api/contact-us/ticket — footer "Raise a Ticket"
// ============================================================
export const raiseTicket = async (req, res) => {
  if (isBot(req.body)) return res.status(200).json({ success: true, message: "Your ticket has been raised." });

  const { name, email, message, errors } = validate(req.body);
  if (Object.keys(errors).length) return badRequest(res, errors);

  const missing = missingMailSettings();
  if (missing.length) {
    console.error(`Raise a Ticket: Microsoft 365 email is not configured — add ${missing.join(", ")} to .env`);
    return mailUnavailable(res);
  }

  const when = submittedAt();
  const ticket = submissionEmail({
    heading: "New support ticket",
    intro: "A customer has raised a ticket from the website footer.",
    name,
    email,
    message,
    when,
  });

  try {
    await sendMail({
      to: TICKET_TO,
      replyTo: { name, address: email },
      subject: `Support ticket from ${name} – ${BRAND}`,
      html: ticket.html,
    });
  } catch (err) {
    return mailFailed(res, err, "Support ticket");
  }

  return res.status(200).json({
    success: true,
    message: "Your ticket has been raised. Our team will contact you soon.",
  });
};