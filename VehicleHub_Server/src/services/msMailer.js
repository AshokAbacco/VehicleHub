// VehicleHub/VehicleHub_Server/src/services/msMailer.js
// Sends email through Microsoft 365 (Microsoft Graph, app sign-in) as MS_SMTP_USER —
// the same .env settings the Contact Us emails use. Supports file attachments (e.g. invoice PDFs).
//
//   MS_TENANT_ID, MS_CLIENT_ID, MS_CLIENT_SECRET, MS_SMTP_USER
// The Entra app needs the Microsoft Graph *Application* permission "Mail.Send" (admin consent).

const env = (name) => String(process.env[name] || "").trim().replace(/^["']|["']$/g, "").trim();
const settings = () => ({
  tenant: env("MS_TENANT_ID"),
  clientId: env("MS_CLIENT_ID"),
  secret: env("MS_CLIENT_SECRET"),
  sender: env("MS_SMTP_USER"),
});

export const missingMailSettings = () =>
  Object.entries({
    MS_TENANT_ID: settings().tenant,
    MS_CLIENT_ID: settings().clientId,
    MS_CLIENT_SECRET: settings().secret,
    MS_SMTP_USER: settings().sender,
  })
    .filter(([, v]) => !v)
    .map(([k]) => k);

export const senderAddress = () => settings().sender;

export class MailError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

let tokenCache = { token: null, expiresAt: 0 };

const getAccessToken = async () => {
  if (tokenCache.token && Date.now() < tokenCache.expiresAt - 60_000) return tokenCache.token;
  const { tenant, clientId, secret } = settings();
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

/**
 * @param {{ to: string|{name,address}, subject: string, html: string, replyTo?: string|{name,address},
 *           attachments?: { filename: string, content: Buffer, contentType?: string }[] }} mail
 */
export const sendMail = async ({ to, subject, html, replyTo, attachments = [] }) => {
  const missing = missingMailSettings();
  if (missing.length) throw new MailError(`Email is not configured — add ${missing.join(", ")} to .env`, "not_configured");

  const token = await getAccessToken();
  const res = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(settings().sender)}/sendMail`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: {
        subject,
        body: { contentType: "HTML", content: html },
        toRecipients: [recipient(to)],
        ...(replyTo ? { replyTo: [recipient(replyTo)] } : {}),
        ...(attachments.length
          ? {
              attachments: attachments.map((a) => ({
                "@odata.type": "#microsoft.graph.fileAttachment",
                name: a.filename,
                contentType: a.contentType || "application/octet-stream",
                contentBytes: Buffer.from(a.content).toString("base64"),
              })),
            }
          : {}),
      },
      saveToSentItems: true,
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (res.status !== 202 && !res.ok) {
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) tokenCache = { token: null, expiresAt: 0 };
    // e.g. ErrorAccessDenied = Mail.Send not granted, MailboxNotEnabledForRESTAPI = no Exchange mailbox
    throw new MailError(`Microsoft Graph sendMail failed (${res.status}): ${data?.error?.message || res.statusText}`, data?.error?.code || `http_${res.status}`);
  }
};