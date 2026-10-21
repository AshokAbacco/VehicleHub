// VehicleHub/VehicleHub_Server/src/controllers/sellerController.js
// ============================================================
// SELLER REGISTRATION + SELLER PROFILE — mounted in routes/sellerRoutes.js
//
// Flow: a BUYER (or a visitor, who also sends a password and gets a BUYER account) submits
//       POST /api/sellers/register -> SellerProfile PENDING.
//       They stay a BUYER until an admin approves them (routes/adminRoutes.js ->
//       PATCH /api/admin/sellers/:id/approve), which switches the role to SELLER.
//       A rejected applicant can correct the form and submit again.
// ============================================================
import { z } from "zod";
import { prisma } from "../config/db.js";
import { storeUpload, deleteStoredFiles } from "../utils/storeUpload.js";
import { normalizePhone, normalizeWhatsApp } from "../utils/phone.js";
import bcrypt from "bcryptjs";
import { generateAccessToken } from "../utils/generateToken.js";
import { queueRegistrationEmails } from "../services/registrationEmails.js";
import { SELLING_ROLES, roleForSellerType, listingAllowance, accountTypeLabel } from "../utils/sellerAccount.js";

// ============================================================
// Validation schemas
// ============================================================

const sellerRegistrationSchema = z.object({
  sellerType: z.enum(["Individual", "Dealer"]),
  ownerName: z.string().min(2, "Owner name is required"),
  businessName: z.string().optional().nullable(),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(4, "Pincode is required"),
  gstNumber: z.string().optional().nullable(),
  panNumber: z.string().min(1, "PAN number is required"),
  yearsInBusiness: z.union([z.string(), z.number()]).optional().nullable(),
  website: z.string().optional().nullable(),
  bankAccountHolder: z.string().optional().nullable(),
  bankAccountNumber: z.string().optional().nullable(),
  bankIFSC: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  // WhatsApp: "true" = the phone number above is also WhatsApp; otherwise an optional other number
  whatsappSameAsPhone: z.union([z.boolean(), z.string()]).optional().nullable(),
  whatsappNumber: z.string().optional().nullable(),
  // Pricing page: the verified plan payment this application continues from (optional)
  subscriptionPaymentId: z.string().max(64).optional().nullable(),
}).superRefine((d, ctx) => {
  // A dealer account is a shop — it needs the shop / business name
  if (d.sellerType === "Dealer" && !String(d.businessName || "").trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["businessName"], message: "Shop / business name is required for a dealer account" });
  }
});

// Files arrive as multer memory files (req.files[field][0]); stored in Cloudflare R2
const uploadField = async (req, field, folder = "vehiclehub/sellers") => {
  const file = req.files?.[field]?.[0];
  return file ? storeUpload(file, folder, req) : null;
};

const notifyAdmins = async (tx, data) => {
  const admins = await tx.user.findMany({ where: { role: "ADMIN", isActive: true }, select: { id: true } });
  if (!admins.length) return;
  await tx.notification.createMany({ data: admins.map((a) => ({ ...data, userId: a.id })) });
};

/**
 * WhatsApp choice from the registration / profile form.
 *   sameAsPhone true  -> the phone number is the WhatsApp number
 *   sameAsPhone false -> whatsappNumber (optional — empty means "no WhatsApp")
 * Returns { number, sameAsPhone } or { error }.
 */
const resolveWhatsApp = (sameAsPhoneRaw, otherNumber, phone) => {
  const sameAsPhone = sameAsPhoneRaw === true || String(sameAsPhoneRaw).toLowerCase() === "true";
  const number = normalizeWhatsApp(sameAsPhone ? phone : otherNumber);
  if (number === null) {
    return { error: sameAsPhone ? "Your phone number isn't a valid WhatsApp mobile number — enter the WhatsApp number separately" : "Enter a valid WhatsApp mobile number" };
  }
  return { number: number || null, sameAsPhone };
};

// ============================================================
// POST /api/sellers/register   (multipart: profilePhoto, shopLogo, panCardImage, gstCertificate)
// ============================================================
export const registerSeller = async (req, res) => {
  try {
    // Anyone can apply. A visitor without an account also sends a password: the account (BUYER)
    // and the application are created together, and they are signed in.
    let userId = req.user?.id;
    const isGuest = !userId;
    if (!isGuest && req.user.role !== "BUYER" && !SELLING_ROLES.includes(req.user.role)) {
      return res.status(403).json({ message: "Admin and field inspector accounts can't register as sellers." });
    }

    const parsed = sellerRegistrationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Please check the highlighted fields.",
        errors: parsed.error.flatten().fieldErrors,
      });
    }
    const data = parsed.data;

    const whatsapp = resolveWhatsApp(data.whatsappSameAsPhone, data.whatsappNumber, data.phone);
    if (whatsapp.error) {
      return res.status(400).json({ message: "Please check the highlighted fields.", errors: { whatsappNumber: [whatsapp.error] } });
    }

    let newAccount = null;
    if (isGuest) {
      const password = String(req.body?.password || "");
      if (password.length < 6) {
        return res.status(400).json({ message: "Please check the highlighted fields.", errors: { password: ["Password must be at least 6 characters"] } });
      }
      const email = String(data.email).trim().toLowerCase();
      const phone = normalizePhone(data.phone);
      const [emailTaken, phoneTaken] = await Promise.all([
        prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } }, select: { id: true } }),
        phone ? prisma.user.findFirst({ where: { phone }, select: { id: true } }) : null,
      ]);
      if (emailTaken || phoneTaken) {
        return res.status(409).json({
          message: `An account with this ${emailTaken ? "email" : "mobile number"} already exists. Please sign in first, then apply.`,
          errors: emailTaken ? { email: ["Already registered — sign in first"] } : { phone: ["Already registered — sign in first"] },
        });
      }
      newAccount = { email, phone: phone || null, password: await bcrypt.hash(password, 10) };
    }

    // One application per account. A rejected applicant may resubmit.
    const existing = isGuest ? null : await prisma.sellerProfile.findUnique({ where: { userId } });
    if (existing && existing.verificationStatus !== "REJECTED") {
      return res.status(409).json({
        message:
          existing.verificationStatus === "APPROVED"
            ? `Your ${existing.sellerType === "DEALER" ? "dealer" : "seller"} account is already approved.`
            : "Your seller application is already under review.",
        status: existing.verificationStatus,
      });
    }

    const [profilePhotoUrl, shopLogoUrl, panCardUrl, gstCertUrl] = await Promise.all([
      uploadField(req, "profilePhoto"),
      uploadField(req, "shopLogo"),
      uploadField(req, "panCardImage"),
      uploadField(req, "gstCertificate"),
    ]);

    const profileData = {
      sellerType: data.sellerType === "Dealer" ? "DEALER" : "INDIVIDUAL",
      ownerName: data.ownerName,
      businessName: data.businessName || null,
      description: data.description || null,
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      gstNumber: data.gstNumber || null,
      panNumber: data.panNumber,
      yearsInBusiness: data.yearsInBusiness ? Number(data.yearsInBusiness) : null,
      website: data.website || null,
      bankAccountHolder: data.bankAccountHolder || null,
      bankAccountNumber: data.bankAccountNumber || null,
      bankIFSC: data.bankIFSC || null,
      bankName: data.bankName || null,
      whatsappNumber: whatsapp.number,
      whatsappSameAsPhone: whatsapp.sameAsPhone,
      ...(profilePhotoUrl ? { profilePhoto: profilePhotoUrl } : {}),
      ...(shopLogoUrl ? { shopLogo: shopLogoUrl } : {}),
      verificationStatus: "PENDING",
      isApproved: false,
      rejectReason: null,
      submittedAt: new Date(),
      reviewedAt: null,
      reviewedBy: null,
    };

    let createdUser = null;
    const result = await prisma.$transaction(async (tx) => {
      if (newAccount) {
        createdUser = await tx.user.create({
          data: { ...newAccount, role: "BUYER", fullName: data.ownerName, isActive: true },
        });
        userId = createdUser.id;
      }
      const profile = existing
        ? await tx.sellerProfile.update({ where: { id: existing.id }, data: profileData })
        : await tx.sellerProfile.create({ data: { userId, ...profileData } });

      // Plan bought on the Pricing page -> attach it to this application (only a verified,
      // not-yet-used payment; nothing happens if the id is wrong or already linked)
      if (data.subscriptionPaymentId) {
        await tx.subscriptionPayment.updateMany({
          where: { id: data.subscriptionPaymentId, status: "SUCCESS", sellerProfileId: null },
          data: { sellerProfileId: profile.id, userId: userId },
        });
      }

      const docs = [
        [panCardUrl, "PAN_CARD"],
        [gstCertUrl, "GST_CERTIFICATE"],
        [profilePhotoUrl, "PROFILE_PHOTO"],
        [shopLogoUrl, "SHOP_LOGO"],
      ].filter(([url]) => url);
      if (docs.length) {
        await tx.sellerDocument.createMany({
          data: docs.map(([fileUrl, type]) => ({ sellerProfileId: profile.id, type, fileUrl })),
        });
      }

      // Keep the account details in sync with the application. The role stays BUYER
      // until an admin approves. `phone` is @unique, so only update it when it's free.
      // Same "+91…" format the phone sign-in uses, or the next sign-in would create a new account
      const phone = normalizePhone(data.phone);
      const phoneOwner = phone
        ? await tx.user.findFirst({ where: { phone, NOT: { id: userId } }, select: { id: true } })
        : null;
      await tx.user.update({
        where: { id: userId },
        data: {
          fullName: data.ownerName,
          ...(phone && !phoneOwner ? { phone } : {}),
        },
      });

      await notifyAdmins(tx, {
        type: "SYSTEM_ALERT",
        title: existing
          ? `${data.sellerType === "Dealer" ? "Dealer" : "Seller"} application resubmitted`
          : `New ${data.sellerType === "Dealer" ? "dealer" : "seller"} registration`,
        message: `${data.businessName || data.ownerName} is waiting for verification.`,
        metadata: { kind: "seller_registration", sellerUserId: userId, sellerProfileId: profile.id },
      });

      await tx.activityLog.create({
        data: {
          userId,
          action: existing ? "seller.registration_resubmitted" : "seller.registration_submitted",
          entityType: "SellerProfile",
          entityId: profile.id,
          metadata: { businessName: data.businessName, sellerType: data.sellerType },
        },
      });

      return profile;
    });

    // Saved -> welcome email to the client + approval email to the admin (MS_SMTP_USER).
    // In the background: an email problem never fails or repeats the registration.
    queueRegistrationEmails({ sellerProfileId: result.id, userId, resubmitted: Boolean(existing) });

    return res.status(201).json({
      success: true,
      message: "Registration submitted for verification. You will be notified once an admin reviews it.",
      sellerProfile: {
        id: result.id,
        verificationStatus: result.verificationStatus,
      },
      // New visitors are signed in straight away (as a buyer until approved)
      ...(createdUser
        ? { accessToken: generateAccessToken(createdUser), user: (({ password, ...u }) => u)(createdUser) }
        : {}),
    });
  } catch (error) {
    console.error("registerSeller error:", error);
    return res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : "Something went wrong while submitting your registration.",
    });
  }
};

// ============================================================
// GET /api/sellers/me/status  (also /api/sellers/:sellerId/seller-status — always the logged-in user)
// ============================================================
export const getSellerStatus = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        role: true,
        sellerProfile: {
          select: {
            id: true, ownerName: true, businessName: true, sellerType: true,
            verificationStatus: true, rejectReason: true, submittedAt: true, reviewedAt: true,
            whatsappNumber: true, whatsappSameAsPhone: true,
          },
        },
      },
    });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const status = user.sellerProfile?.verificationStatus || null;
    const approvedRole = user.sellerProfile ? roleForSellerType(user.sellerProfile.sellerType) : null;
    const isApproved = status === "APPROVED" && SELLING_ROLES.includes(user.role);
    return res.json({
      success: true,
      role: user.role,
      isSellerRegistered: !!user.sellerProfile,
      status, // null | PENDING | APPROVED | REJECTED | SUSPENDED
      isApproved,
      // "Seller" (individual, one vehicle at a time) | "Dealer" (shop, many vehicles)
      accountType: accountTypeLabel(isApproved ? user.role : approvedRole),
      listingAllowance: isApproved ? await listingAllowance(user) : null,
      rejectReason: user.sellerProfile?.rejectReason || null,
      sellerProfile: user.sellerProfile,
    });
  } catch (error) {
    console.error("SELLER STATUS ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to check seller status" });
  }
};

// ============================================================
// GET /api/sellers/:sellerId/dashboard   (admin)
// ============================================================
export const getSellerDashboard = async (req, res) => {
  try {
    const seller = await prisma.user.findUnique({
      where: { id: req.params.sellerId },
      include: { vehicles: { orderBy: { createdAt: "desc" } } },
    });
    if (!seller) return res.status(404).json({ success: false, message: "Seller not found" });

    const count = (status) => seller.vehicles.filter((v) => v.status === status).length;
    res.json({
      success: true,
      seller: { id: seller.id, name: seller.fullName, email: seller.email, phone: seller.phone, role: seller.role },
      statistics: {
        totalVehicles: seller.vehicles.length,
        availableVehicles: count("AVAILABLE"),
        pendingVehicles: count("PENDING"),
        soldVehicles: count("SOLD"),
      },
      vehicles: seller.vehicles,
    });
  } catch (error) {
    console.error("Seller dashboard error:", error);
    res.status(500).json({ success: false, message: "Failed to load seller dashboard" });
  }
};

// ============================================================
// SELLER'S OWN BUSINESS PROFILE (SellerProfile.jsx)
//   GET    /api/sellers/me/profile
//   PATCH  /api/sellers/me/profile          multipart (profilePhoto optional)
//   POST   /api/sellers/me/documents        multipart "documents" + documentType
//   DELETE /api/sellers/me/documents/:documentId
// ============================================================
const profileInclude = {
  user: { select: { id: true, fullName: true, email: true, phone: true, createdAt: true } },
  documents: { orderBy: { uploadedAt: "desc" } },
};

const toProfileDTO = (p) => ({
  ...p,
  email: p.user?.email || null,
  phone: p.user?.phone || null,
  sellerType: p.sellerType === "DEALER" ? "Dealer" : "Individual",
});

export const getMyProfile = async (req, res, next) => {
  try {
    const profile = await prisma.sellerProfile.findUnique({ where: { userId: req.user.id }, include: profileInclude });
    if (!profile) return res.status(404).json({ success: false, message: "No seller profile found" });
    return res.json({ success: true, data: toProfileDTO(profile) });
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const profile = await prisma.sellerProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ success: false, message: "No seller profile found" });

    const b = req.body || {};
    const data = {};
    ["ownerName", "businessName", "description", "gstNumber", "panNumber", "address", "city", "state", "pincode", "website"].forEach((k) => {
      if (b[k] !== undefined) data[k] = String(b[k]).trim() || null;
    });
    if (data.ownerName === null) return res.status(400).json({ success: false, message: "Owner name is required" });
    // sellerType is fixed once approved (it decides Seller vs Dealer access) — not editable here
    const photo = await uploadField(req, "profilePhoto");
    if (photo) data.profilePhoto = photo;

    const userData = {};
    if (data.ownerName) userData.fullName = data.ownerName;
    if (b.phone !== undefined && String(b.phone).trim()) {
      const phone = normalizePhone(b.phone);
      const taken = await prisma.user.findFirst({ where: { phone, NOT: { id: req.user.id } }, select: { id: true } });
      if (taken) return res.status(409).json({ success: false, message: "This phone number is already used by another account" });
      userData.phone = phone;
    }

    // WhatsApp: changed when the form sends it, and kept in step with the phone when "same as phone"
    if (b.whatsappSameAsPhone !== undefined || b.whatsappNumber !== undefined || (userData.phone && profile.whatsappSameAsPhone)) {
      const sameAsPhone = b.whatsappSameAsPhone !== undefined ? b.whatsappSameAsPhone : profile.whatsappSameAsPhone;
      const currentPhone = userData.phone || (await prisma.user.findUnique({ where: { id: req.user.id }, select: { phone: true } }))?.phone;
      const whatsapp = resolveWhatsApp(sameAsPhone, b.whatsappNumber ?? profile.whatsappNumber, currentPhone);
      if (whatsapp.error) return res.status(400).json({ success: false, message: whatsapp.error });
      data.whatsappNumber = whatsapp.number;
      data.whatsappSameAsPhone = whatsapp.sameAsPhone;
    }

    const [updated] = await prisma.$transaction([
      prisma.sellerProfile.update({ where: { id: profile.id }, data, include: profileInclude }),
      ...(Object.keys(userData).length ? [prisma.user.update({ where: { id: req.user.id }, data: userData })] : []),
    ]);
    const fresh = await prisma.sellerProfile.findUnique({ where: { id: updated.id }, include: profileInclude });
    return res.json({ success: true, message: "Profile updated", data: toProfileDTO(fresh) });
  } catch (error) {
    next(error);
  }
};

const DOCUMENT_TYPES = ["PAN_CARD", "GST_CERTIFICATE", "SHOP_LOGO", "PROFILE_PHOTO", "RC", "INSURANCE", "POLLUTION", "INVOICE", "SERVICE_BOOK", "OWNERSHIP_PROOF", "OTHER"];

export const uploadMyDocuments = async (req, res, next) => {
  try {
    const profile = await prisma.sellerProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ success: false, message: "No seller profile found" });
    const files = req.files?.documents || [];
    if (!files.length) return res.status(400).json({ success: false, message: "Choose at least one file" });
    const type = DOCUMENT_TYPES.includes(String(req.body?.documentType)) ? req.body.documentType : "OTHER";
    const urls = [];
    for (const f of files) urls.push(await storeUpload(f, "vehiclehub/sellers", req));
    await prisma.sellerDocument.createMany({
      data: urls.filter(Boolean).map((fileUrl) => ({ sellerProfileId: profile.id, type, fileUrl })),
    });
    const fresh = await prisma.sellerProfile.findUnique({ where: { id: profile.id }, include: profileInclude });
    return res.status(201).json({ success: true, message: "Document(s) uploaded", data: toProfileDTO(fresh) });
  } catch (error) {
    next(error);
  }
};

export const deleteMyDocument = async (req, res, next) => {
  try {
    const profile = await prisma.sellerProfile.findUnique({ where: { userId: req.user.id }, select: { id: true } });
    if (!profile) return res.status(404).json({ success: false, message: "No seller profile found" });
    const doc = await prisma.sellerDocument.findFirst({
      where: { id: req.params.documentId, sellerProfileId: profile.id },
      select: { id: true, fileUrl: true },
    });
    if (!doc) return res.status(404).json({ success: false, message: "Document not found" });
    await prisma.sellerDocument.delete({ where: { id: doc.id } });
    await deleteStoredFiles([doc.fileUrl]);
    return res.json({ success: true, message: "Document deleted" });
  } catch (error) {
    next(error);
  }
};