import bcrypt from "bcryptjs";
import { prisma } from "../config/db.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";

class AuthService {
  async register(payload) {
    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (existingUser) {
      const error = new Error("Email already registered");
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);
    const user = await prisma.user.create({
      data: {
        email: payload.email,
        username: payload.username || payload.email.split("@")[0],
        password: hashedPassword,
        role: payload.role || "BUYER",
        firstName: payload.firstName,
        lastName: payload.lastName,
        phone: payload.phone,
      },
    });

    return {
      user: { ...user, password: undefined },
      accessToken: generateAccessToken(user),
      refreshToken: generateRefreshToken(user),
    };
  }

  async login(payload) {
    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (!user) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }

    const isValid = await bcrypt.compare(payload.password, user.password);
    if (!isValid) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }

    return {
      user: { ...user, password: undefined },
      accessToken: generateAccessToken(user),
      refreshToken: generateRefreshToken(user),
    };
  }
}

export default new AuthService();
