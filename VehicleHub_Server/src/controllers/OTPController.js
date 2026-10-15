// VehicleHub/VehicleHub_Server/src/controllers/OTPController.js
import { prisma } from "../config/db.js";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../config/jwt.js";
import bcrypt from "bcryptjs";

import { normalizePhone } from "../utils/phone.js";

const createUserRecord = async (phone) => {
  const normalizedPhone = normalizePhone(phone);
  const email = `${normalizedPhone.replace(/\D/g, "")}@vehiclehub.local`;
  const passwordHash = await bcrypt.hash("vehiclehub@123", 10);
  const isAdminPhone = normalizedPhone === "+919506536127";

  return prisma.user.create({
    data: {
      email,
      password: passwordHash,
      phone: normalizedPhone,
      fullName: "",
      lastName: "",
      role: isAdminPhone ? "ADMIN" : "BUYER",
      isVerified: true,
      isActive: true,
    },
  });
};

export const sendOTP = async (req, res) => {
  try {
    const { mobile } = req.body;
    const normalizedPhone = normalizePhone(mobile);

    if (!normalizedPhone) {
      return res.status(400).json({
        success: false,
        message: "Mobile Required",
      });
    }

    const dummyOtp = process.env.DummyOTP || "1234";

    return res.json({
      success: true,
      verificationId: "dummy-verification-id",
      otp: dummyOtp,
      message: "OTP sent successfully",
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Unable to send OTP",
    });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    const normalizedPhone = normalizePhone(mobile);
    const expectedOtp = process.env.DummyOTP || "1234";

    if (!normalizedPhone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Mobile and OTP are required",
      });
    }

    if (otp !== expectedOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    let user = await prisma.user.findFirst({
      where: {
        phone: normalizedPhone,
      },
    });

    if (!user) {
      user = await createUserRecord(normalizedPhone);
    }

    const isAdminPhone = normalizedPhone === "+919506536127";
    if (isAdminPhone && (user.role !== "ADMIN" || !user.fullName)) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          role: "ADMIN",
          fullName: "Auro Admin",
          lastName: "Admin",
        },
      });
    }

    // Sign token without expiry so it remains valid until server-side session revocation
    // Use the same secret the auth middleware verifies with (config/jwt.js),
    // otherwise a missing/different JWT_SECRET makes every protected call 401.
    const accessToken = jwt.sign({ id: user.id, role: user.role }, jwtSecret);

    return res.json({
      success: true,
      // Client (AuthModal) reads `accessToken` — same as the email OTP flow.
      accessToken,
      token: accessToken, // kept for backward compatibility
      needsFullName: !user.fullName?.trim(),
      user: {
        ...user,
        password: undefined, // never send the password hash to the browser
        name: user.fullName || user.lastName || "User",
      },
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: "OTP Verification Failed",
    });
  }
};

export const completeProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { fullName, lastName, phone } = req.body;

    if (!fullName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "fullName name is required",
      });
    }

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        fullName: fullName.trim(),
        lastName: lastName?.trim() || null,
        // only when given — never blank out the number a phone sign-in depends on
        ...(normalizePhone(phone) ? { phone: normalizePhone(phone) } : {}),
      },
    });

    return res.json({
      success: true,
      message: "Profile completed successfully",

      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        isSeller: user.isSeller,
        sellerApproved: user.sellerApproved,
      },
    });
  } catch (error) {
    console.error("PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to complete profile",
    });
  }
};