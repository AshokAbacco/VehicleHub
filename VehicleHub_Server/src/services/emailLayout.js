// VehicleHub/VehicleHub_Server/src/services/emailLayout.js
// One look for every email MotorDesk sends (invoice, registration, password reset, contact
// us, tickets): navy header with the brand, white body, light footer.
//
// Support email / phone appear in ONE place only:
//  - if the body already shows them (e.g. "contact us at support@… or +91 …"), the footer
//    leaves them out;
//  - otherwise the footer shows them.
// Emails to our own team (internal: true) never repeat our own contact details.
import { COMPANY } from "./invoicePdf.js";

export const escapeHtml = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const digits = (s) => String(s || "").replace(/\D/g, "");

/** True when the html already contains our support email or phone number. */
export const mentionsCompanyContacts = (html) => {
  const text = String(html || "");
  const phone = digits(COMPANY.phone);
  return text.toLowerCase().includes(String(COMPANY.email).toLowerCase()) || (phone && digits(text).includes(phone));
};

/** Support email + phone as links — use inside a body when the customer should contact us. */
export const supportContacts = (color = "#1d4ed8") =>
  `<a href="mailto:${COMPANY.email}" style="color:${color}">${COMPANY.email}</a> or ` +
  `<a href="tel:${digits(COMPANY.phone).replace(/^/, "+")}" style="color:${color};white-space:nowrap">${escapeHtml(COMPANY.phone)}</a>`;

/**
 * @param {object} o
 * @param {string} o.subtitle   small line under the brand in the header
 * @param {string} o.body       inner html
 * @param {boolean} [o.internal] email to the MotorDesk team (no contact details in the footer)
 * @param {number} [o.width]    max width in px
 */
export const emailLayout = ({ subtitle, body, internal = false, width = 600 }) => {
  const showContacts = !internal && !mentionsCompanyContacts(body);
  const footer = [
    `<strong style="color:#64748b">${escapeHtml(COMPANY.name)}</strong> · ${escapeHtml(COMPANY.address.join(" "))}`,
    showContacts
      ? `<a href="mailto:${COMPANY.email}" style="color:#64748b">${COMPANY.email}</a> · ${escapeHtml(COMPANY.phone)}`
      : null,
    internal ? "This is an automated notification from the MotorDesk website." : null,
  ]
    .filter(Boolean)
    .join("<br>");

  return `
<div style="font-family:Arial,Helvetica,sans-serif;background:#f1f5f9;padding:32px 12px">
  <div style="max-width:${width}px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0">
    <div style="background:#001f3f;padding:22px 28px">
      <div style="color:#ffffff;font-size:22px;font-weight:bold">${escapeHtml(COMPANY.name)}</div>
      ${subtitle ? `<div style="color:#bfdbfe;font-size:12px;margin-top:4px">${escapeHtml(subtitle)}</div>` : ""}
    </div>
    <div style="padding:26px 28px;color:#334155;font-size:14px;line-height:1.6">${body}</div>
    <div style="padding:16px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:12px;line-height:1.6">
      ${footer}
    </div>
  </div>
</div>`;
};