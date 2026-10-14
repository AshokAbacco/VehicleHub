import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

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
});

const rejectSchema = z.object({
  reason: z.string().min(3, "Rejection reason is required"),
});

// ============================================================
// Helpers
// ============================================================

const toSellerProfileDTO = (profile) => ({
  id: profile.id,
  userId: profile.userId,
  ownerName: profile.ownerName,
  businessName: profile.businessName,
  sellerType: profile.sellerType,
  email: profile.user?.email,
  phone: profile.user?.phone,
  address: profile.address,
  city: profile.city,
  state: profile.state,
  pincode: profile.pincode,
  country: profile.country,
  gstNumber: profile.gstNumber,
  panNumber: profile.panNumber,
  yearsInBusiness: profile.yearsInBusiness,
  website: profile.website,
  bankAccountHolder: profile.bankAccountHolder,
  bankAccountNumber: profile.bankAccountNumber,
  bankIFSC: profile.bankIFSC,
  bankName: profile.bankName,
  description: profile.description,
  profilePhoto: profile.profilePhoto,
  shopLogo: profile.shopLogo,
  verificationStatus: profile.verificationStatus,
  rejectReason: profile.rejectReason,
  submittedAt: profile.submittedAt,
  reviewedAt: profile.reviewedAt,
  isElite: profile.isElite,
  rating: profile.rating,
  totalReviews: profile.totalReviews,
  documents: profile.documents,
});

// Files can arrive either as multer's `req.files` (multipart) or already-uploaded URLs in `req.body`
const extractFileUrl = (req, fieldName) => {
  const file =
    req.files?.find?.((f) => f.fieldname === fieldName) ||
    req.files?.[fieldName]?.[0];
  return file?.path || file?.location || req.body?.[fieldName] || null;
};

// ============================================================
// POST /api/sellers/register
// Called by SellerRegistration.jsx on submit. Creates the SellerProfile
// as PENDING and attaches any uploaded documents.
// ============================================================

export const registerSeller = async (req, res) => {
  try {
    const userId = req.user?.id; // set by auth middleware after phone/OTP verification
    if (!userId) {
      return res.status(401).json({
        message: "Authentication required before registering as a seller.",
      });
    }

    const parsed = sellerRegistrationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Please check the highlighted fields.",
        errors: parsed.error.flatten().fieldErrors,
      });
    }
    const data = parsed.data;

    // Prevent duplicate registration
    const existing = await prisma.sellerProfile.findUnique({
      where: { userId },
    });
    if (existing) {
      return res.status(409).json({
        message: "A seller registration already exists for this account.",
        status: existing.verificationStatus,
      });
    }

    const profilePhotoUrl = extractFileUrl(req, "profilePhoto");
    const shopLogoUrl = extractFileUrl(req, "shopLogo");
    const panCardUrl = extractFileUrl(req, "panCardImage");
    const gstCertUrl = extractFileUrl(req, "gstCertificate");

    const result = await prisma.$transaction(async (tx) => {
      const profile = await tx.sellerProfile.create({
        data: {
          userId,
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
          yearsInBusiness: data.yearsInBusiness
            ? Number(data.yearsInBusiness)
            : null,
          website: data.website || null,
          bankAccountHolder: data.bankAccountHolder || null,
          bankAccountNumber: data.bankAccountNumber || null,
          bankIFSC: data.bankIFSC || null,
          bankName: data.bankName || null,
          profilePhoto: profilePhotoUrl,
          shopLogo: shopLogoUrl,
          verificationStatus: "PENDING",
        },
      });

      // Attach uploaded compliance documents
      const docsToCreate = [];
      if (panCardUrl)
        docsToCreate.push({
          sellerProfileId: profile.id,
          type: "PAN_CARD",
          fileUrl: panCardUrl,
        });
      if (gstCertUrl)
        docsToCreate.push({
          sellerProfileId: profile.id,
          type: "GST_CERTIFICATE",
          fileUrl: gstCertUrl,
        });
      if (profilePhotoUrl)
        docsToCreate.push({
          sellerProfileId: profile.id,
          type: "PROFILE_PHOTO",
          fileUrl: profilePhotoUrl,
        });
      if (shopLogoUrl)
        docsToCreate.push({
          sellerProfileId: profile.id,
          type: "SHOP_LOGO",
          fileUrl: shopLogoUrl,
        });
      if (docsToCreate.length) {
        await tx.sellerDocument.createMany({ data: docsToCreate });
      }

      // Update the user's fullName/phone if this registration provided better data,
      // and flag their intended role as SELLER (actual role flip happens on approval).
      // NOTE: User has no `isSeller` column — role = SELLER is the seller flag.
      // `phone` is @unique, so only update it when no other account uses it.
      const phoneOwner = data.phone
        ? await tx.user.findFirst({
            where: { phone: data.phone, NOT: { id: userId } },
            select: { id: true },
          })
        : null;

      await tx.user.update({
        where: { id: userId },
        data: {
          fullName: data.ownerName,
          ...(data.phone && !phoneOwner ? { phone: data.phone } : {}),
          role: "SELLER",
        },
      });

      // Log the submission for the admin activity feed
      await tx.activityLog.create({
        data: {
          userId,
          action: "seller.registration_submitted",
          entityType: "SellerProfile",
          entityId: profile.id,
          metadata: {
            businessName: data.businessName,
            sellerType: data.sellerType,
          },
        },
      });

      return profile;
    });

    return res.status(201).json({
      message:
        "Registration submitted for verification. You will be notified once reviewed.",
      sellerProfile: {
        id: result.id,
        verificationStatus: result.verificationStatus,
      },
    });
  } catch (error) {
    console.error("registerSeller error:", error);
    return res.status(500).json({
      message: "Something went wrong while submitting your registration.",
    });
  }
};

// admin dashboard route to fetch seller dashboard data
export const getSellerDashboard = async (req, res) => {
  try {
    if (!["ADMIN", "SUPER_ADMIN"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const { sellerId } = req.params;

    const seller = await prisma.user.findUnique({
      where: {
        id: sellerId,
      },
      include: {
        vehicles: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    const totalVehicles = seller.vehicles.length;

    const availableVehicles = seller.vehicles.filter(
      (vehicle) => vehicle.status === "AVAILABLE",
    ).length;

    const pendingVehicles = seller.vehicles.filter(
      (vehicle) => vehicle.status === "PENDING",
    ).length;

    const soldVehicles = seller.vehicles.filter(
      (vehicle) => vehicle.status === "SOLD",
    ).length;

    res.json({
      success: true,
      seller: {
        id: seller.id,
        name: `${seller.firstName || ""} ${seller.lastName || ""}`.trim(),
        email: seller.email,
        phone: seller.phone,
        role: seller.role,
      },
      statistics: {
        totalVehicles,
        availableVehicles,
        pendingVehicles,
        soldVehicles,
      },
      vehicles: seller.vehicles,
    });
  } catch (error) {
    console.error("Seller dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load seller dashboard",
    });
  }
};

export const getSellerStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        sellerProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isSellerRegistered = !!user.sellerProfile;
    const isApproved = user.sellerProfile?.verificationStatus === "APPROVED";

    return res.json({
      success: true,
      isSellerRegistered,
      isApproved,
      sellerProfile: user.sellerProfile,
    });
  } catch (error) {
    console.error("SELLER STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to check seller status",
    });
  }
};