// VehicleHub/VehicleHub_Server/src/controllers/vehicleController.js
// ============================================================
// VEHICLES — mounted at /api/vehicles (routes/vehicleRoutes.js)
//
// Public:   GET /, /homepage, /featured, /search, /filter, /:id
// Seller / Dealer: POST /   (approved accounts; listing goes to admin approval.
//                            A Seller may have one open listing at a time; a Dealer has no limit)
//           PUT  /:id         (own vehicles only; a live listing goes back to approval)
//           DELETE /:id, DELETE /:id/images, PATCH /:id/sold, PATCH /:id/pending (own only)
//           GET  /my/listings, DELETE /my/listings/:id
// Admin:    everything above for any vehicle + GET /admin/pending,
//           PATCH /:id/approve, PATCH /:id/reject
// ============================================================
import vehicleService from "../services/vehicleService.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { prisma } from "../config/db.js";
import { storeUpload, deleteStoredFiles } from "../utils/storeUpload.js";
import { toVehicleDTO, categoryEmoji } from "../utils/vehicleDto.js";
import { listingAllowance, SELLER_LIMIT_MESSAGE } from "../utils/sellerAccount.js";

const isAdminUser = (user) => user?.role === "ADMIN";
// Every stored file a vehicle points to (photos + documents)
const vehicleFiles = (v) => [...(v?.images || []), ...(v?.documentImages || []), v?.rcFront, v?.insuranceDocument, v?.thumbnail].filter(Boolean);
// What the listing shows as the seller type — always taken from the account, never from the form
const accountSellerType = (role) => (role === "DEALER" ? "Dealer" : "Individual");

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
const toStr = (v) => (v === undefined || v === null ? undefined : String(v).trim() || null);
const pick = (...values) => values.find((v) => v !== undefined && v !== null && v !== "");
const parseJsonArray = (v) => {
  if (v === undefined) return undefined;
  try {
    const parsed = JSON.parse(v);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

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

// Feature checkbox label -> boolean column
const FEATURE_FLAGS = {
  abs: "ABS",
  sunroof: "Sunroof",
  alloyWheels: "Alloy Wheels",
  bluetooth: "Bluetooth",
  touchscreen: "Touch Screen",
  reverseCamera: "Reverse Camera",
  parkingSensors: "Parking Sensors",
  powerSteering: "Power Steering",
  powerWindows: "Power Windows",
  ac: "Air Conditioner",
  cruiseControl: "Cruise Control",
  keylessEntry: "Keyless Entry",
};

/**
 * Map Add/Edit Vehicle form fields (AddVehicleForm / EditVehicleModal) to Vehicle columns.
 * partial = true (edit): only fields present in the request are changed.
 */
const vehicleDataFromForm = (b, { partial = false } = {}) => {
  const out = {};
  const has = (keys) => keys.some((k) => b[k] !== undefined);
  const set = (field, keys, convert = toStr) => {
    if (partial && !has(keys)) return;
    out[field] = convert(pick(...keys.map((k) => b[k])));
  };

  set("title", ["title"]);
  set("description", ["description"]);
  set("brand", ["brand"]);
  set("model", ["model"]);
  set("variant", ["variant"]);
  set("vehicleType", ["category"]);

  set("price", ["price"], toFloat);
  set("expectedPrice", ["expectedPrice"], toFloat);
  set("negotiable", ["negotiable"], toBool);
  set("emiAvailable", ["emiAvailable"], toBool);

  set("year", ["year", "manufacturingYear"], toInt);
  set("registrationYear", ["registrationYear"], toInt);
  set("mileage", ["kmDriven"], toInt); // Vehicle.mileage = KM driven (the form's "mileage" is km/l)
  set("fuelType", ["fuelType"]);
  set("transmission", ["transmission"]);
  set("bodyType", ["bodyType"]);
  set("ownership", ["ownership"], toInt); // "1st Owner" -> 1
  set("color", ["color"]);
  set("engineCapacity", ["engineCapacity"]);
  set("seatingCapacity", ["seatingCapacity"], toInt);
  set("registrationNumber", ["registrationNumber"]);
  set("registrationState", ["registrationState"]);
  set("vinNumber", ["vin", "vinNumber"]);
  set("location", ["location", "area"]);
  set("city", ["city"]);
  set("state", ["state"]);
  set("pincode", ["pincode"]);

  set("insuranceCompany", ["insuranceCompany"]);
  set("insuranceExpiry", ["insuranceExpiry"], toDate);
  set("insuranceType", ["insuranceType"]);
  set("fitnessValidTill", ["fitnessValidTill"], toDate);
  set("pollutionValidTill", ["pollutionValidTill"], toDate);

  set("airbags", ["airbags"], toInt);

  // Owner / seller contact shown on the listing
  set("ownerName", ["sellerName", "dealerName", "ownerName"]);
  set("ownerPhone", ["mobileNumber", "ownerPhone"]);
  set("ownerEmail", ["email", "ownerEmail"]);
  set("sellerType", ["sellerType"]);

  // Condition
  set("condition", ["vehicleCondition", "condition"]);
  set("engineCondition", ["engineCondition"]);
  set("tyreCondition", ["tyreCondition"]);
  set("batteryCondition", ["batteryCondition"]);
  set("floodDamage", ["floodDamage"], toBool);
  set("accidental", ["accidentHistory", "accidental"], toBool);

  // Extra details (form sends Yes/No for service book; Vehicle.serviceBook is a file URL)
  set("serviceHistory", ["serviceBook", "serviceHistory"], toBool);
  set("loanRunning", ["loanPending", "loanRunning"], toBool);
  set("nocAvailable", ["nocAvailable"], toBool);
  set("numberOfKeys", ["numberOfKeys"], toInt);

  // Features: the checkbox list also drives the boolean columns
  if (!partial || b.features !== undefined) {
    const features = Array.isArray(b.features) ? b.features : b.features ? [b.features] : [];
    out.features = features;
    const hasFeature = (name) => features.some((f) => String(f).toLowerCase() === name.toLowerCase());
    Object.entries(FEATURE_FLAGS).forEach(([field, label]) => {
      out[field] = toBool(b[field]) || hasFeature(label);
    });
  }

  // Strip undefined so Prisma keeps current values / schema defaults
  Object.keys(out).forEach((k) => out[k] === undefined && delete out[k]);
  return out;
};

const uploadMany = async (files, folder, req) => {
  const urls = [];
  for (const file of files || []) urls.push(await storeUpload(file, folder, req));
  return urls.filter(Boolean);
};

const detailInclude = {
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
};

// Load a vehicle and make sure the current user may change it (owner or admin)
const loadOwnedVehicle = async (req, res) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: req.params.id } });
  if (!vehicle) {
    sendError(res, "Vehicle not found", 404);
    return null;
  }
  if (!isAdminUser(req.user) && vehicle.sellerId !== req.user.id) {
    sendError(res, "You can only manage your own vehicles", 403);
    return null;
  }
  return vehicle;
};

// ============================================================
// CREATE — POST /api/vehicles (multipart/form-data from AddVehicleForm / AdminAddVehicleForm)
//   files: "images" (multiple), "rcFront", "insuranceDocument"
// ============================================================
export const createVehicle = async (req, res, next) => {
  try {
    const b = req.body || {};

    if (!b.title || !b.brand || !b.model || !b.price || !b.fuelType || !b.transmission) {
      return sendError(res, "Missing required vehicle fields", 400);
    }
    const data = vehicleDataFromForm(b);
    if (data.price === undefined) return sendError(res, "Price must be a valid number", 400);

    // Seller (individual) = one open listing at a time; Dealer = no limit. Checked before any upload.
    if (!isAdminUser(req.user)) {
      const allowance = await listingAllowance(req.user);
      if (!allowance.canAdd) return res.status(409).json({ success: false, code: "SELLER_LISTING_LIMIT", message: SELLER_LIMIT_MESSAGE });
      data.sellerType = accountSellerType(req.user.role);
    }

    const imageUrls = await uploadMany(req.files?.images, "vehiclehub/vehicles", req);
    const rcFrontUrl = (await uploadMany(req.files?.rcFront, "vehiclehub/documents", req))[0];
    const insuranceDocumentUrl = (await uploadMany(req.files?.insuranceDocument, "vehiclehub/documents", req))[0];

    const isAdmin = isAdminUser(req.user);
    // Admin "Add Vehicle" form: publish now (default) or keep as a draft
    const adminPublish = b.publishImmediately === undefined || toBool(b.publishImmediately);
    const now = new Date();
    const payload = {
      ...data,
      categoryId: await resolveCategoryId(b.categoryId, b.category),
      brandId: b.brandId || undefined,
      sellerId: req.user.id,
      rcFront: rcFrontUrl,
      insuranceDocument: insuranceDocumentUrl,
      images: imageUrls,
      thumbnail: imageUrls[0],
      documentImages: [rcFrontUrl, insuranceDocumentUrl].filter(Boolean),
      // Seller listings wait for admin approval; a listing added by the admin is live right away
      ...(isAdmin
        ? adminPublish
          ? { status: "AVAILABLE", isApproved: true, isVerified: true, publishedAt: now, isFeatured: toBool(b.isFeatured) }
          : { status: "DRAFT", isApproved: false }
        : { status: "PENDING", isApproved: false }),
    };
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    const vehicle = await vehicleService.createVehicle(payload);
    await prisma.vehicleStatusHistory.create({
      data: {
        vehicleId: vehicle.id,
        fromStatus: null,
        toStatus: vehicle.status,
        reason: isAdmin ? "Listed by admin" : "Listing submitted",
        changedById: req.user.id,
      },
    });

    if (!isAdmin) {
      // Let the admins know there is something to review
      const admins = await prisma.user.findMany({ where: { role: "ADMIN", isActive: true }, select: { id: true } });
      if (admins.length) {
        await prisma.notification.createMany({
          data: admins.map((a) => ({
            userId: a.id,
            type: "SYSTEM_ALERT",
            title: "New vehicle awaiting approval",
            message: `${vehicle.title} was submitted for review.`,
            metadata: { vehicleId: vehicle.id, kind: "vehicle_submitted" },
          })),
        });
      }
    }

    sendSuccess(
      res,
      isAdmin ? (adminPublish ? "Vehicle added and published" : "Vehicle saved as a draft") : "Vehicle submitted for admin approval",
      toVehicleDTO(vehicle),
      201,
    );
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE — PUT /api/vehicles/:id (EditVehicleModal, multipart/form-data)
//   existingImages (JSON) + new "images", rcFront / insuranceDocument files,
//   removeRcFront / removeInsuranceDocument, existingDocuments (JSON) + new "documents"
// ============================================================
export const updateVehicle = async (req, res, next) => {
  try {
    const existing = await loadOwnedVehicle(req, res);
    if (!existing) return;
    const isAdmin = isAdminUser(req.user);
    if (!isAdmin && existing.status === "SOLD") {
      return sendError(res, "Sold vehicles can't be edited", 409);
    }

    const b = req.body || {};
    const data = vehicleDataFromForm(b, { partial: true });
    if (b.category !== undefined || b.categoryId !== undefined) {
      data.categoryId = await resolveCategoryId(b.categoryId, b.category);
    }
    if (isAdmin && b.isFeatured !== undefined) data.isFeatured = toBool(b.isFeatured);
    if (!isAdmin) data.sellerType = accountSellerType(req.user.role);

    // Images: kept URLs (after removals) + new uploads
    // only files that already belong to this vehicle can be "kept"
    const keptImages = parseJsonArray(b.existingImages)?.filter((u) => (existing.images || []).includes(u));
    const newImages = await uploadMany(req.files?.images, "vehiclehub/vehicles", req);
    if (keptImages !== undefined || newImages.length) {
      data.images = [...(keptImages ?? existing.images ?? []), ...newImages];
      data.thumbnail = data.images[0] || null;
    }

    // Single documents
    const rc = (await uploadMany(req.files?.rcFront, "vehiclehub/documents", req))[0];
    if (rc) data.rcFront = rc;
    else if (toBool(b.removeRcFront)) data.rcFront = null;
    const ins = (await uploadMany(req.files?.insuranceDocument, "vehiclehub/documents", req))[0];
    if (ins) data.insuranceDocument = ins;
    else if (toBool(b.removeInsuranceDocument)) data.insuranceDocument = null;

    // Additional documents
    const keptDocs = parseJsonArray(b.existingDocuments)?.filter((u) => (existing.documentImages || []).includes(u));
    const newDocs = await uploadMany(req.files?.documents, "vehiclehub/documents", req);
    if (keptDocs !== undefined || newDocs.length) {
      data.documentImages = [...(keptDocs ?? existing.documentImages ?? []), ...newDocs];
    }

    // A seller's edit to a draft, live or rejected listing goes (back) to admin review
    const backToReview = !isAdmin && ["DRAFT", "AVAILABLE", "APPROVED", "REJECTED"].includes(existing.status);
    if (backToReview) {
      data.status = "PENDING";
      data.isApproved = false;
      data.rejectReason = null;
    }

    const vehicle = await prisma.vehicle.update({ where: { id: existing.id }, data, include: detailInclude });
    // Remove replaced / deleted files from R2
    const stillUsed = new Set(vehicleFiles(vehicle));
    await deleteStoredFiles(vehicleFiles(existing).filter((u) => !stillUsed.has(u)));

    if (backToReview) {
      await prisma.vehicleStatusHistory.create({
        data: {
          vehicleId: existing.id,
          fromStatus: existing.status,
          toStatus: "PENDING",
          reason: "Edited by seller — sent for re-approval",
          changedById: req.user.id,
        },
      });
    }

    sendSuccess(
      res,
      backToReview ? "Vehicle updated and sent to admin for re-approval" : "Vehicle updated successfully",
      toVehicleDTO(vehicle),
    );
  } catch (error) {
    next(error);
  }
};

// DELETE /api/vehicles/:id/images   body: { imageUrl }
export const deleteVehicleImage = async (req, res, next) => {
  try {
    const existing = await loadOwnedVehicle(req, res);
    if (!existing) return;
    const imageUrl = req.body?.imageUrl;
    if (!imageUrl) return sendError(res, "imageUrl is required", 400);
    const images = (existing.images || []).filter((url) => url !== imageUrl);
    const vehicle = await prisma.vehicle.update({
      where: { id: existing.id },
      data: { images, thumbnail: images[0] || null },
    });
    if ((existing.images || []).includes(imageUrl)) await deleteStoredFiles([imageUrl]);
    sendSuccess(res, "Image removed", toVehicleDTO(vehicle));
  } catch (error) {
    next(error);
  }
};

// Delete a vehicle if nothing references it; otherwise tell the caller to archive it
const removeVehicle = async (req, res) => {
  const vehicle = await loadOwnedVehicle(req, res);
  if (!vehicle) return;
  const id = vehicle.id;
  try {
    await prisma.$transaction([
      prisma.wishlist.deleteMany({ where: { vehicleId: id } }),
      prisma.cartItem.deleteMany({ where: { vehicleId: id } }),
      prisma.vehicle.delete({ where: { id } }), // status history + purchase requests cascade
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
  await deleteStoredFiles(vehicleFiles(vehicle));
  return sendSuccess(res, "Listing deleted successfully");
};

export const deleteVehicle = async (req, res, next) => {
  try {
    await removeVehicle(req, res);
  } catch (error) {
    next(error);
  }
};

// ============================================================
// PUBLIC LISTINGS
// ============================================================
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

// GET /api/vehicles/:id — public vehicle detail page (VehicleDetailPage.jsx)
export const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: req.params.id },
      include: detailInclude,
    });
    if (!vehicle) return sendError(res, "Vehicle not found", 404);
    sendSuccess(res, "Vehicle fetched successfully", toVehicleDTO(vehicle));
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

// Shape a Vehicle row the way the admin review UI expects
// (it uses the AddVehicleForm field names).
const toApprovalDTO = (v) => {
  const categoryName = v.category?.name || v.vehicleType || null;
  const sellerProfile = v.seller?.sellerProfile;
  const inspection = v.inspections?.[0];
  const { inspections, ...rest } = v;
  return {
    ...rest,
    category: categoryName,
    thumb: categoryEmoji(categoryName),
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

    // latest field inspection (assigned from the review modal)
    inspection: inspection
      ? {
          id: inspection.id,
          status: inspection.status,
          result: inspection.result,
          scheduledAt: inspection.scheduledAt,
          inspectorName: inspection.inspector?.fullName || null,
        }
      : null,

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
        inspections: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { id: true, status: true, result: true, scheduledAt: true, inspector: { select: { fullName: true } } },
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

// ============================================================
// Status changes by the owner (or admin)
// PATCH /api/vehicles/:id/sold     body: { soldPrice? }
// PATCH /api/vehicles/:id/pending  (resubmit for approval)
// ============================================================
export const soldVehicle = async (req, res, next) => {
  try {
    const existing = await loadOwnedVehicle(req, res);
    if (!existing) return;
    const soldPrice = toFloat(req.body?.soldPrice);
    const vehicle = await prisma.vehicle.update({
      where: { id: existing.id },
      data: { status: "SOLD", soldAt: new Date(), ...(soldPrice !== undefined ? { soldPrice } : {}) },
    });
    await prisma.vehicleStatusHistory.create({
      data: { vehicleId: existing.id, fromStatus: existing.status, toStatus: "SOLD", reason: "Marked sold", changedById: req.user.id },
    });
    sendSuccess(res, "Vehicle marked sold", toVehicleDTO(vehicle));
  } catch (error) {
    next(error);
  }
};

export const pendingVehicle = async (req, res, next) => {
  try {
    const existing = await loadOwnedVehicle(req, res);
    if (!existing) return;
    if (existing.status === "SOLD") return sendError(res, "Sold vehicles can't be resubmitted", 409);
    // Re-opening an archived listing counts against an individual seller's one-listing limit
    if (existing.status === "ARCHIVED" && !isAdminUser(req.user)) {
      const allowance = await listingAllowance(req.user);
      if (!allowance.canAdd) return res.status(409).json({ success: false, code: "SELLER_LISTING_LIMIT", message: SELLER_LIMIT_MESSAGE });
    }
    const vehicle = await prisma.vehicle.update({
      where: { id: existing.id },
      data: { status: "PENDING", isApproved: false },
    });
    await prisma.vehicleStatusHistory.create({
      data: { vehicleId: existing.id, fromStatus: existing.status, toStatus: "PENDING", reason: "Submitted for approval", changedById: req.user.id },
    });
    sendSuccess(res, "Vehicle sent for approval", toVehicleDTO(vehicle));
  } catch (error) {
    next(error);
  }
};

// ============================================================
// SELLER: "my listings"
// GET    /api/vehicles/my/listings?status=draft|pending|under_verification|approved|rejected|sold|archived
// DELETE /api/vehicles/my/listings/:id
// Used by ActiveListingsPage, SoldVehiclesPage, InventoryOverviewTable, SellerDashboardPage,
// and the Draft / Pending / Approved / Rejected pages (they read `data.vehicles`).
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
        _count: { select: { inquiries: true, wishlist: true, purchaseRequests: true } },
      },
    });

    // Flatten relations + add the form field names so EditVehicleModal can prefill
    const rows = vehicles.map(({ _count, ...v }) => {
      const dto = toVehicleDTO(v);
      return {
        ...dto,
        categoryName: dto.category,
        inquiriesCount: (_count?.inquiries ?? 0) + (_count?.purchaseRequests ?? 0),
        wishlistCount: _count?.wishlist ?? 0,
      };
    });

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
    await removeVehicle(req, res);
  } catch (error) {
    next(error);
  }
};