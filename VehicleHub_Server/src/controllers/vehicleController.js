// import vehicleService from '../services/vehicleService.js';
// import { sendSuccess, sendError  } from '../utils/response.js';
// import { validate  } from '../middleware/validationMiddleware.js';
// import { createVehicleSchema  } from '../validations/vehicleValidation.js';

// export const createVehicle = [
//   validate(createVehicleSchema),
//   async (req, res, next) => {
//     try {
//       const vehicle = await vehicleService.createVehicle({ ...req.body, sellerId: req.user?.id || req.body.sellerId });
//       sendSuccess(res, 'Vehicle created successfully', vehicle, 201);
//     } catch (error) {
//       next(error);
//     }
//   },
// ];

// export const updateVehicle = async (req, res, next) => {
//   try {
//     const vehicle = await vehicleService.updateVehicle(req.params.id, req.body);
//     sendSuccess(res, 'Vehicle updated successfully', vehicle);
//   } catch (error) {
//     next(error);
//   }
// };

// export const deleteVehicle = async (req, res, next) => {
//   try {
//     await vehicleService.deleteVehicle(req.params.id);
//     sendSuccess(res, 'Vehicle deleted successfully');
//   } catch (error) {
//     next(error);
//   }
// };

// export const getAllVehicles = async (req, res, next) => {
//   try {
//     const data = await vehicleService.getAllVehicles(req.query);
//     sendSuccess(res, 'Vehicles fetched successfully', data);
//   } catch (error) {
//     next(error);
//   }
// };

// export const getVehicleById = async (req, res, next) => {
//   try {
//     const vehicle = await vehicleService.getVehicleById(req.params.id);
//     if (!vehicle) return sendError(res, 'Vehicle not found', 404);
//     sendSuccess(res, 'Vehicle fetched successfully', vehicle);
//   } catch (error) {
//     next(error);
//   }
// };

// export const getFeaturedVehicles = async (req, res, next) => {
//   try {
//     const vehicles = await vehicleService.getAllVehicles({ ...req.query, isFeatured: true });
//     sendSuccess(res, 'Featured vehicles fetched successfully', vehicles);
//   } catch (error) {
//     next(error);
//   }
// };

// export const searchVehicle = async (req, res, next) => {
//   try {
//     const data = await vehicleService.getAllVehicles(req.query);
//     sendSuccess(res, 'Search results fetched successfully', data);
//   } catch (error) {
//     next(error);
//   }
// };

// export const filterVehicle = async (req, res, next) => {
//   try {
//     const data = await vehicleService.getAllVehicles(req.query);
//     sendSuccess(res, 'Filtered vehicles fetched successfully', data);
//   } catch (error) {
//     next(error);
//   }
// };

// export const uploadImages = async (req, res) => sendSuccess(res, 'Vehicle images upload ready');
// export const approveVehicle = async (req, res) => sendSuccess(res, 'Vehicle approved');
// export const rejectVehicle = async (req, res) => sendSuccess(res, 'Vehicle rejected');
// export const soldVehicle = async (req, res) => sendSuccess(res, 'Vehicle marked sold');
// export const pendingVehicle = async (req, res) => sendSuccess(res, 'Vehicle marked pending');
import vehicleService from "../services/vehicleService.js";
import cloudinaryService from "../services/cloudinaryService.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { prisma } from "../config/db.js";
/**
 * CREATE — expects multipart/form-data:
 *   - text fields matching the Vehicle model
 *   - "images"           -> multiple files (multer .array('images'))
 *   - "rcFront"           -> single file (multer .single or another .array with maxCount:1)
 *   - "insuranceDocument" -> single file
 */
// ---- helpers: form-data values always arrive as strings ----
const toBool = (v) =>
  v === true || ["yes", "true", "1", "on"].includes(String(v ?? "").trim().toLowerCase());
const toInt = (v) => {
  if (v === undefined || v === null || v === "") return undefined;
  const n = parseInt(String(v).replace(/[^\d-]/g, ""), 10); // "1st Owner" -> 1, "24,000" -> 24000
  return Number.isNaN(n) ? undefined : n;
};
const toFloat = (v) => {
  if (v === undefined || v === null || v === "") return undefined;
  const n = parseFloat(String(v).replace(/[^\d.-]/g, ""));
  return Number.isNaN(n) ? undefined : n;
};
const toDate = (v) => {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
};
const pick = (...values) => values.find((v) => v !== undefined && v !== null && v !== "");

// Category in the form is a name ("Car", "Bike"...). Vehicle.category is a RELATION,
// so resolve it to Category.id (create the category the first time it is used).
const resolveCategoryId = async (categoryId, categoryName) => {
  if (categoryId) return categoryId;
  const name = String(categoryName || "").trim();
  if (!name) return undefined;
  const existing = await prisma.category.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
    select: { id: true },
  });
  if (existing) return existing.id;
  const created = await prisma.category.create({
    data: { name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
    select: { id: true },
  });
  return created.id;
};

export const createVehicle = async (req, res, next) => {
  try {
    // Debug: log incoming request summary to help trace missing fields/files
    try {
      console.log("createVehicle: user=", req.user?.id || null);
      console.log(
        "createVehicle: body keys=",
        Object.keys(req.body || {}).join(", ") || "(none)",
      );
      console.log(
        "createVehicle: files=",
        Object.keys(req.files || {})
          .map((k) => `${k}(${(req.files[k] || []).length})`)
          .join(", ") || "(none)",
      );
    } catch (logErr) {
      console.log("createVehicle: debug log error", logErr);
    }

    const b = req.body || {};

    // Basic required-field guard
    if (!b.title || !b.brand || !b.model || !b.price || !b.fuelType || !b.transmission) {
      return sendError(res, "Missing required vehicle fields", 400);
    }

    const price = toFloat(b.price);
    if (price === undefined) {
      return sendError(res, "Price must be a valid number", 400);
    }

    // ---- Upload gallery images (multiple) ----
    const imageFiles = req.files?.images || [];
    const imageUrls = [];
    for (const file of imageFiles) {
      const result = await cloudinaryService.uploadBuffer(
        file.buffer,
        "vehiclehub/vehicles",
      );
      imageUrls.push(result.secure_url);
    }

    // ---- Upload single documents ----
    const rcFrontFile = req.files?.rcFront?.[0];
    const insuranceDocFile = req.files?.insuranceDocument?.[0];

    const rcFrontUrl = rcFrontFile
      ? (await cloudinaryService.uploadBuffer(rcFrontFile.buffer, "vehiclehub/documents"))
          .secure_url
      : undefined;

    const insuranceDocumentUrl = insuranceDocFile
      ? (await cloudinaryService.uploadBuffer(insuranceDocFile.buffer, "vehiclehub/documents"))
          .secure_url
      : undefined;

    const categoryId = await resolveCategoryId(b.categoryId, b.category);

    const features = Array.isArray(b.features)
      ? b.features
      : b.features
        ? [b.features]
        : [];
    const hasFeature = (name) =>
      features.some((f) => String(f).toLowerCase() === name.toLowerCase());

    // Map AddVehicleForm field names -> Prisma Vehicle model fields
    const payload = {
      title: b.title,
      description: b.description,
      brand: b.brand,
      model: b.model,
      variant: b.variant,
      vehicleType: b.category, // keep the plain category name too
      categoryId,
      brandId: b.brandId || undefined,
      sellerId: req.user?.id, // set by authenticateUser middleware

      price,
      expectedPrice: toFloat(b.expectedPrice),
      negotiable: toBool(b.negotiable),
      emiAvailable: toBool(b.emiAvailable),

      year: toInt(pick(b.year, b.manufacturingYear)),
      registrationYear: toInt(b.registrationYear),
      mileage: toInt(pick(b.kmDriven, b.mileage)), // Vehicle.mileage is Int (km driven)
      fuelType: b.fuelType,
      transmission: b.transmission,
      bodyType: b.bodyType,
      ownership: toInt(b.ownership), // "1st Owner" -> 1
      color: b.color,
      engineCapacity: b.engineCapacity ? String(b.engineCapacity) : undefined,
      seatingCapacity: toInt(b.seatingCapacity),
      registrationNumber: b.registrationNumber,
      registrationState: b.registrationState,
      vinNumber: b.vin,
      location: pick(b.location, b.area),
      city: b.city,
      state: b.state,
      pincode: b.pincode,

      insuranceCompany: b.insuranceCompany,
      insuranceExpiry: toDate(b.insuranceExpiry),
      insuranceType: b.insuranceType,
      fitnessValidTill: toDate(b.fitnessValidTill),
      pollutionValidTill: toDate(b.pollutionValidTill),

      rcFront: rcFrontUrl,
      insuranceDocument: insuranceDocumentUrl,
      images: imageUrls,
      thumbnail: imageUrls[0],
      documentImages: [rcFrontUrl, insuranceDocumentUrl].filter(Boolean),

      features,
      airbags: toInt(b.airbags),
      abs: toBool(b.abs) || hasFeature("ABS"),
      sunroof: toBool(b.sunroof) || hasFeature("Sunroof"),
      alloyWheels: toBool(b.alloyWheels) || hasFeature("Alloy Wheels"),
      bluetooth: toBool(b.bluetooth) || hasFeature("Bluetooth"),
      touchscreen: toBool(b.touchscreen) || hasFeature("Touch Screen"),
      reverseCamera: toBool(b.reverseCamera) || hasFeature("Reverse Camera"),
      parkingSensors: toBool(b.parkingSensors) || hasFeature("Parking Sensors"),
      powerSteering: toBool(b.powerSteering) || hasFeature("Power Steering"),
      powerWindows: toBool(b.powerWindows) || hasFeature("Power Windows"),
      ac: toBool(b.ac) || hasFeature("Air Conditioner"),
      cruiseControl: toBool(b.cruiseControl) || hasFeature("Cruise Control"),
      keylessEntry: toBool(b.keylessEntry) || hasFeature("Keyless Entry"),

      // Owner / seller details from the form
      ownerName: pick(b.sellerName, b.dealerName),
      ownerPhone: b.mobileNumber,
      ownerEmail: b.email,
      sellerType: b.sellerType,

      // Condition
      condition: b.vehicleCondition,
      engineCondition: b.engineCondition,
      tyreCondition: b.tyreCondition,
      batteryCondition: b.batteryCondition,
      floodDamage: toBool(b.floodDamage),
      accidental: toBool(b.accidentHistory),

      // Extra details
      serviceHistory: toBool(b.serviceBook), // form sends Yes/No; Vehicle.serviceBook is a file URL
      loanRunning: toBool(b.loanPending),
      nocAvailable: toBool(b.nocAvailable),
      numberOfKeys: toInt(b.numberOfKeys),

      isFeatured: toBool(b.isFeatured),
    };

    // Strip undefined keys so Prisma uses schema defaults where nothing was sent
    Object.keys(payload).forEach(
      (k) => payload[k] === undefined && delete payload[k],
    );

    const vehicle = await vehicleService.createVehicle(payload);
    sendSuccess(res, "Vehicle created successfully", vehicle, 201);
  } catch (error) {
    next(error);
  }
};

export const updateVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = { ...req.body };

    // Frontend sends "existingImages" (JSON array of URLs kept after user deletions)
    // when the image gallery was edited; merge that with any newly uploaded files.
    let keptImages;
    if (body.existingImages !== undefined) {
      try {
        keptImages = JSON.parse(body.existingImages);
        if (!Array.isArray(keptImages)) keptImages = [];
      } catch {
        keptImages = [];
      }
      delete body.existingImages;
    }

    // Optional: allow adding more images / replacing documents on update
    if (req.files?.images?.length) {
      const newUrls = [];
      for (const file of req.files.images) {
        const result = await cloudinaryService.uploadBuffer(
          file.buffer,
          "vehiclehub/vehicles",
        );
        newUrls.push(result.secure_url);
      }
      if (keptImages !== undefined) {
        body.images = [...keptImages, ...newUrls];
      } else {
        const existing = await vehicleService.getVehicleById(id);
        body.images = [...(existing?.images || []), ...newUrls];
      }
    } else if (keptImages !== undefined) {
      body.images = keptImages;
    }

    if (req.files?.rcFront?.[0]) {
      const result = await cloudinaryService.uploadBuffer(
        req.files.rcFront[0].buffer,
        "vehiclehub/documents",
      );
      body.rcFront = result.secure_url;
    }
    if (req.files?.insuranceDocument?.[0]) {
      const result = await cloudinaryService.uploadBuffer(
        req.files.insuranceDocument[0].buffer,
        "vehiclehub/documents",
      );
      body.insuranceDocument = result.secure_url;
    }

    // Cast numeric fields if present
    [
      "price",
      "expectedPrice",
      "year",
      "registrationYear",
      "mileage",
      "ownership",
      "seatingCapacity",
      "airbags",
    ].forEach((k) => {
      if (body[k] !== undefined) body[k] = Number(body[k]);
    });

    const vehicle = await vehicleService.updateVehicle(id, body);
    sendSuccess(res, "Vehicle updated successfully", vehicle);
  } catch (error) {
    next(error);
  }
};

export const deleteVehicle = async (req, res, next) => {
  try {
    await vehicleService.deleteVehicle(req.params.id);
    sendSuccess(res, "Vehicle deleted successfully");
  } catch (error) {
    next(error);
  }
};

export const getAllVehicles = async (req, res, next) => {
  try {
    const data = await vehicleService.getAllVehicles(req.query);
    sendSuccess(res, "Vehicles fetched successfully", data);
  } catch (error) {
    next(error);
  }
};

export const getHomepageVehicles = async (req, res, next) => {
  try {
    const data = await vehicleService.getHomepageVehicles();
    sendSuccess(res, "Homepage vehicles fetched successfully", data);
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET /api/vehicles/:id  — public vehicle detail page (VehicleDetailPage.jsx)
// Returns every Vehicle column plus the seller and category, and the
// AddVehicleForm-style field names the page reads (sellerName, mobileNumber,
// kmDriven, manufacturingYear, vin, rcAvailable, …).
// ============================================================
const isFuture = (d) => Boolean(d) && new Date(d).getTime() > Date.now();

const toVehicleDetailDTO = (v) => {
  const profile = v.seller?.sellerProfile;
  const { category, seller, ...rest } = v;
  const profileType = profile?.sellerType === "DEALER" ? "Dealer" : profile?.sellerType === "INDIVIDUAL" ? "Individual" : null;
  return {
    ...rest,
    category: category?.name || v.vehicleType || null,
    categoryId: v.categoryId,

    // Seller (listing contact first, then the seller's account / business profile)
    sellerName: v.ownerName || profile?.businessName || profile?.ownerName || seller?.fullName || null,
    sellerBusinessName: profile?.businessName || null,
    sellerVerified: profile?.verificationStatus === "APPROVED",
    mobileNumber: v.ownerPhone || seller?.phone || null,
    email: v.ownerEmail || seller?.email || null,
    sellerType: v.sellerType || profileType,

    // Form-name aliases
    kmDriven: v.mileage, // Vehicle.mileage stores km driven
    manufacturingYear: v.year,
    vin: v.vinNumber || v.chassisNumber || null,
    vehicleCondition: v.condition,
    area: v.location,
    accidentHistory: v.accidental,
    loanPending: v.loanRunning,
    rcAvailable: Boolean(v.rcFront || v.rcBack),
    insuranceAvailable: Boolean(v.insuranceDocument || v.insuranceCompany) && (!v.insuranceExpiry || isFuture(v.insuranceExpiry)),
    pollutionCertificate: Boolean(v.pollutionDocument) || isFuture(v.pollutionValidTill),
    serviceBook: v.serviceBook || v.serviceHistory || null,
  };
};

export const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: req.params.id },
      include: {
        category: { select: { id: true, name: true } },
        seller: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
            sellerProfile: {
              select: { businessName: true, ownerName: true, sellerType: true, verificationStatus: true },
            },
          },
        },
      },
    });
    if (!vehicle) return sendError(res, "Vehicle not found", 404);
    sendSuccess(res, "Vehicle fetched successfully", toVehicleDetailDTO(vehicle));
  } catch (error) {
    next(error);
  }
};

export const getFeaturedVehicles = async (req, res, next) => {
  try {
    const vehicles = await vehicleService.getAllVehicles({
      ...req.query,
      isFeatured: true,
    });
    sendSuccess(res, "Featured vehicles fetched successfully", vehicles);
  } catch (error) {
    next(error);
  }
};

export const searchVehicle = async (req, res, next) => {
  try {
    const data = await vehicleService.getAllVehicles(req.query);
    sendSuccess(res, "Search results fetched successfully", data);
  } catch (error) {
    next(error);
  }
};

export const filterVehicle = async (req, res, next) => {
  try {
    const data = await vehicleService.getAllVehicles(req.query);
    sendSuccess(res, "Filtered vehicles fetched successfully", data);
  } catch (error) {
    next(error);
  }
};

// ============================================================
// ADMIN: vehicle approvals
// GET   /api/vehicles/admin/pending      -> { success, data: { vehicles, total } }
// PATCH /api/vehicles/:id/approve
// PATCH /api/vehicles/:id/reject         body: { reason }
// Used by VehicleApprovalsPage + VehicleReviewModal.
// ============================================================

const yesNo = (v) => (v === true ? "Yes" : v === false ? "No" : v ?? null);

const CATEGORY_EMOJI = {
  car: "🚗",
  bike: "🏍️",
  scooter: "🛵",
  truck: "🚚",
  bus: "🚌",
  auto: "🛺",
  tractor: "🚜",
  "commercial vehicle": "🚐",
};

// Shape a Vehicle row the way the admin review UI expects
// (it uses the AddVehicleForm field names).
const toApprovalDTO = (v) => {
  const categoryName = v.category?.name || v.vehicleType || null;
  const sellerProfile = v.seller?.sellerProfile;
  return {
    ...v,
    category: categoryName,
    thumb: CATEGORY_EMOJI[String(categoryName || "").toLowerCase()] || "🚘",
    thumbnail: v.thumbnail || v.images?.[0] || null,

    // seller
    sellerId: v.sellerId,
    sellerName:
      v.ownerName ||
      sellerProfile?.businessName ||
      sellerProfile?.ownerName ||
      v.seller?.fullName ||
      null,
    mobileNumber: v.ownerPhone || v.seller?.phone || null,
    email: v.ownerEmail || v.seller?.email || null,
    sellerType: v.sellerType || sellerProfile?.sellerType || null,
    seller: sellerProfile?.businessName || v.seller?.fullName || null,

    // form-name aliases
    vin: v.vinNumber,
    manufacturingYear: v.year,
    kmDriven: v.mileage,
    vehicleCondition: v.condition,
    area: v.location,
    negotiable: yesNo(v.negotiable),
    emiAvailable: yesNo(v.emiAvailable),
    accidentHistory: yesNo(v.accidental),
    floodDamage: yesNo(v.floodDamage),
    loanPending: yesNo(v.loanRunning),
    nocAvailable: yesNo(v.nocAvailable),
    rcAvailable: v.rcFront ? "Yes" : "No",
    insuranceAvailable: v.insuranceDocument || v.insuranceCompany ? "Yes" : "No",
    insuranceExpiry: v.insuranceExpiry
      ? new Date(v.insuranceExpiry).toLocaleDateString("en-IN")
      : null,
    documents: {
      rcFront: v.rcFront || null,
      insuranceDocument: v.insuranceDocument || null,
    },

    submittedAt: v.createdAt
      ? new Date(v.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : null,
  };
};

export const getPendingVehicles = async (req, res, next) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" }, // oldest submissions first
      include: {
        category: { select: { id: true, name: true } },
        seller: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            sellerProfile: {
              select: { businessName: true, ownerName: true, sellerType: true },
            },
          },
        },
      },
    });

    const rows = vehicles.map(toApprovalDTO);
    return sendSuccess(res, "Pending vehicles fetched successfully", {
      vehicles: rows,
      total: rows.length,
    });
  } catch (error) {
    next(error);
  }
};

const changeApprovalStatus = async (req, res, next, decision) => {
  try {
    const { id } = req.params;
    const reason = String(req.body?.reason || "").trim();

    if (decision === "REJECTED" && !reason) {
      return sendError(res, "A rejection reason is required", 400);
    }

    const existing = await prisma.vehicle.findUnique({
      where: { id },
      select: { id: true, title: true, status: true, sellerId: true },
    });
    if (!existing) return sendError(res, "Vehicle not found", 404);

    const approved = decision === "AVAILABLE";

    const vehicle = await prisma.$transaction(async (tx) => {
      const updated = await tx.vehicle.update({
        where: { id },
        data: approved
          ? {
              status: "AVAILABLE",
              isApproved: true,
              isVerified: true,
              rejectReason: null,
              publishedAt: new Date(),
            }
          : {
              status: "REJECTED",
              isApproved: false,
              rejectReason: reason,
            },
      });

      await tx.vehicleStatusHistory.create({
        data: {
          vehicleId: id,
          fromStatus: existing.status,
          toStatus: decision,
          reason: approved ? "Approved by admin" : reason,
          changedById: req.user?.id || null,
        },
      });

      if (existing.sellerId) {
        await tx.notification.create({
          data: {
            userId: existing.sellerId,
            type: approved ? "VEHICLE_APPROVED" : "VEHICLE_REJECTED",
            title: approved ? "Listing approved" : "Listing rejected",
            message: approved
              ? `${existing.title} is now live on VehicleHub.`
              : `${existing.title} was rejected: ${reason}`,
            metadata: { vehicleId: id, ...(approved ? {} : { reason }) },
          },
        });
      }

      await tx.activityLog.create({
        data: {
          userId: req.user?.id || null,
          action: approved ? "vehicle.approved" : "vehicle.rejected",
          entityType: "Vehicle",
          entityId: id,
          metadata: { title: existing.title, ...(approved ? {} : { reason }) },
        },
      });

      return updated;
    });

    return sendSuccess(
      res,
      approved ? "Vehicle approved" : "Vehicle rejected",
      vehicle,
    );
  } catch (error) {
    next(error);
  }
};

export const approveVehicle = (req, res, next) =>
  changeApprovalStatus(req, res, next, "AVAILABLE");

export const rejectVehicle = (req, res, next) =>
  changeApprovalStatus(req, res, next, "REJECTED");

export const soldVehicle = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.updateVehicle(req.params.id, {
      status: "SOLD",
    });
    sendSuccess(res, "Vehicle marked sold", vehicle);
  } catch (error) {
    next(error);
  }
};

export const pendingVehicle = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.updateVehicle(req.params.id, {
      status: "PENDING",
    });
    sendSuccess(res, "Vehicle marked pending", vehicle);
  } catch (error) {
    next(error);
  }
};

// ============================================================
// SELLER: "my listings"
// GET    /api/vehicles/my/listings?status=draft|pending|under_verification|approved|rejected|sold|archived
// DELETE /api/vehicles/my/listings/:id
// Used by ActiveListingsPage, SoldVehiclesPage, InventoryOverviewTable, SellerDashboardPage
// (they read `data.vehicles`).
// ============================================================

const MY_LISTING_STATUS_MAP = {
  draft: ["DRAFT"],
  pending: ["PENDING"],
  under_verification: ["PENDING"],
  approved: ["APPROVED", "AVAILABLE"],
  rejected: ["REJECTED"],
  sold: ["SOLD"],
  archived: ["ARCHIVED"],
};

export const getMyListings = async (req, res, next) => {
  try {
    const where = { sellerId: req.user.id };

    const statusKey = String(req.query.status || "").toLowerCase();
    if (MY_LISTING_STATUS_MAP[statusKey]) {
      where.status = { in: MY_LISTING_STATUS_MAP[statusKey] };
    }

    const vehicles = await prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { inquiries: true, wishlist: true } },
      },
    });

    // Flatten relations so the tables can render plain values
    const rows = vehicles.map(({ category, _count, ...v }) => ({
      ...v,
      category: category?.name || v.vehicleType || null,
      categoryName: category?.name || v.vehicleType || null,
      inquiriesCount: _count?.inquiries ?? 0,
      wishlistCount: _count?.wishlist ?? 0,
    }));

    return res.json({
      success: true,
      message: "Your listings fetched successfully",
      total: rows.length,
      vehicles: rows,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMyListing = async (req, res, next) => {
  try {
    const { id } = req.params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      select: { id: true, sellerId: true },
    });
    if (!vehicle) return sendError(res, "Vehicle not found", 404);

    const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(req.user.role);
    if (vehicle.sellerId !== req.user.id && !isAdmin) {
      return sendError(res, "You can only delete your own listings", 403);
    }

    try {
      await prisma.$transaction([
        prisma.wishlist.deleteMany({ where: { vehicleId: id } }),
        prisma.cartItem.deleteMany({ where: { vehicleId: id } }),
        prisma.vehicle.delete({ where: { id } }), // status history cascades
      ]);
    } catch (err) {
      // Foreign key: vehicle already has orders / inquiries / inspections / payments
      if (err?.code === "P2003") {
        return sendError(
          res,
          "This vehicle has inquiries, orders or inspections linked to it and can't be deleted. Mark it as sold or archive it instead.",
          409,
        );
      }
      throw err;
    }

    return sendSuccess(res, "Listing deleted successfully");
  } catch (error) {
    next(error);
  }
};