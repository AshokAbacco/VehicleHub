// VehicleHub/VehicleHub_Server/src/utils/phone.js
// One phone format everywhere: "+91XXXXXXXXXX". Phone OTP sign-in looks users up in this
// format, so a number saved any other way (e.g. "9000000022") makes the next sign-in
// create a second, empty account.
export const normalizePhone = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.length === 10 ? `+91${digits}` : `+${digits}`;
};