// VehicleHub/VehicleHub_Server/src/utils/phone.js
// One phone format everywhere: "+91XXXXXXXXXX". Phone OTP sign-in looks users up in this
// format, so a number saved any other way (e.g. "9000000022") makes the next sign-in
// create a second, empty account.
export const normalizePhone = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.length === 10 ? `+91${digits}` : `+${digits}`;
};

/**
 * WhatsApp numbers: same "+91XXXXXXXXXX" format. Returns "" for empty input and null when the
 * number isn't a valid mobile number (Indian numbers must be 10 digits starting 6-9;
 * other countries 8-15 digits with the country code).
 */
export const normalizeWhatsApp = (value) => {
  const phone = normalizePhone(value);
  if (!phone) return "";
  if (phone.startsWith("+91")) return /^\+91[6-9]\d{9}$/.test(phone) ? phone : null;
  return /^\+[1-9]\d{7,14}$/.test(phone) ? phone : null;
};