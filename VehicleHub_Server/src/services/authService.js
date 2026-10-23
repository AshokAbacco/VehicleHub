// VehicleHub/VehicleHub_Server/src/services/authService.js
// Email / mobile number + password sign-in (OTP sign-in has been removed).
import bcrypt from "bcryptjs";
import { prisma } from "../config/db.js";
import { generateAccessToken } from "../utils/generateToken.js";
import { normalizePhone } from "../utils/phone.js";

const httpError = (message, statusCode) => Object.assign(new Error(message), { statusCode });

// Never send the password hash to the browser
const publicUser = (user) => {
  const { password, ...rest } = user;
  return { ...rest, name: rest.fullName || rest.email };
};

const isEmail = (value) => String(value).includes("@");

class AuthService {
  // Public sign-up: always a BUYER. Sellers / Dealers are approved by an admin;
  // Admin and Field Inspector accounts are created by an admin.
  async register(payload) {
    const email = String(payload.email).trim().toLowerCase();
    const phone = normalizePhone(payload.phone);

    const [emailTaken, phoneTaken] = await Promise.all([
      prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } }, select: { id: true } }),
      phone ? prisma.user.findFirst({ where: { phone }, select: { id: true } }) : null,
    ]);
    if (emailTaken) throw httpError("An account with this email already exists. Please sign in.", 409);
    if (phoneTaken) throw httpError("An account with this mobile number already exists. Please sign in.", 409);

    const fullName = String(payload.fullName).trim();
    const user = await prisma.user.create({
      data: {
        email,
        phone: phone || null,
        password: await bcrypt.hash(payload.password, 10),
        role: "BUYER",
        fullName,
        lastName: fullName.split(" ").slice(1).join(" ") || null,
        isActive: true,
      },
    });
    return { user: publicUser(user), accessToken: generateAccessToken(user) };
  }

  async login({ identifier, password }) {
    const id = String(identifier || "").trim();
    const where = isEmail(id)
      ? { email: { equals: id.toLowerCase(), mode: "insensitive" } }
      : { phone: normalizePhone(id) };
    const user = await prisma.user.findFirst({ where });

    // Same message for unknown account / wrong password, so accounts can't be probed
    const invalid = () => httpError("Incorrect email / mobile number or password", 401);
    if (!user) throw invalid();
    if (!user.password) {
      throw httpError("This account doesn't have a password yet. Use \"Forgot password?\" to set one with a code sent to your email.", 401);
    }
    if (!(await bcrypt.compare(password, user.password))) throw invalid();
    if (user.isBlocked) throw httpError("Your account has been blocked. Please contact VehicleHub.", 403);
    if (!user.isActive) throw httpError("Your account is inactive. Please contact VehicleHub.", 403);

    return { user: publicUser(user), accessToken: generateAccessToken(user) };
  }
}

export default new AuthService();