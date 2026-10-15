// VehicleHub/VehicleHub_Server/src/controllers/fieldInspectorController.js
// ============================================================
// FIELD INSPECTOR API — mounted at /api/field-inspector (routes/fieldInspectorRoutes.js)
// Every route is for the logged-in INSPECTOR and only touches inspections assigned to them.
// Response shapes match VehicleHub/src/services/fieldInspectorApiSlice.js.
//
// Workflow: admin assigns (ASSIGNED) -> inspector accepts (ACCEPTED) -> starts (IN_PROGRESS)
//           -> saves each verification step -> submits the report (COMPLETED + result).
// ============================================================
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../config/db.js";
import { storeUpload } from "../utils/storeUpload.js";
import { inspectionInclude, toInspectionDTO, inspectionNo } from "../utils/inspectionDto.js";

const ok = (res, data, message = "OK", status = 200) => res.status(status).json({ success: true, message, data });
const fail = (res, message, status = 400) => res.status(status).json({ success: false, message });

const OPEN = ["ASSIGNED", "ACCEPTED", "IN_PROGRESS"];
const WAITING = ["ASSIGNED", "ACCEPTED"];

const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const endOfToday = () => { const d = new Date(); d.setHours(23, 59, 59, 999); return d; };
const newId = () => crypto.randomBytes(8).toString("hex");

const mine = (req, extra = {}) => ({ inspectorId: req.user.id, ...extra });

const list = async (req, where, orderBy = [{ scheduledAt: "asc" }, { createdAt: "desc" }], take) => {
  const rows = await prisma.inspection.findMany({
    where: mine(req, where),
    orderBy,
    ...(take ? { take } : {}),
    include: inspectionInclude,
  });
  return rows.map((i) => toInspectionDTO(i));
};

// Load one of MY inspections (404 for anyone else's)
const loadMine = async (req, res) => {
  const i = await prisma.inspection.findFirst({ where: mine(req, { id: req.params.id }) });
  if (!i) {
    fail(res, "Inspection not found or not assigned to you", 404);
    return null;
  }
  return i;
};

const sendInspection = async (res, id, message = "OK") => {
  const i = await prisma.inspection.findUnique({ where: { id }, include: inspectionInclude });
  let assignedBy = null;
  if (i?.assignedById) {
    assignedBy = await prisma.user.findUnique({ where: { id: i.assignedById }, select: { id: true, fullName: true } });
  }
  return ok(res, toInspectionDTO(i, { assignedBy }), message);
};

// Step saves are only allowed while the job is open; saving the first step starts it.
const loadEditable = async (req, res) => {
  const i = await loadMine(req, res);
  if (!i) return null;
  if (!OPEN.includes(i.status)) {
    fail(res, `This inspection is ${i.status.toLowerCase().replace("_", " ")} and can't be changed`, 409);
    return null;
  }
  return i;
};

const saveStep = async (i, data) => {
  const now = new Date();
  return prisma.inspection.update({
    where: { id: i.id },
    data: {
      ...data,
      ...(i.status !== "IN_PROGRESS"
        ? { status: "IN_PROGRESS", startedAt: i.startedAt || now, acceptedAt: i.acceptedAt || now }
        : {}),
    },
  });
};

const withChecklist = (i, patch) => ({ ...(i.checklist || {}), ...patch });

// ------------------------------------------------------------
// DASHBOARD
// ------------------------------------------------------------
export const getDashboardStats = async (req, res, next) => {
  try {
    const me = req.user.id;
    const today = { gte: startOfToday(), lte: endOfToday() };
    const count = (where) => prisma.inspection.count({ where: { inspectorId: me, ...where } });
    const [total, pending, todayCount, completed, verified, rejected, needsCorrection, overdue, inProgress] = await Promise.all([
      count({}),
      count({ status: { in: WAITING } }),
      count({ scheduledAt: today, status: { in: OPEN } }),
      count({ status: "COMPLETED" }),
      count({ status: "COMPLETED", OR: [{ result: "VERIFIED" }, { result: null, approved: true }] }),
      count({ OR: [{ status: "REJECTED" }, { status: "COMPLETED", result: "REJECTED" }] }),
      count({ status: "COMPLETED", result: "NEEDS_CORRECTION" }),
      count({
        status: { in: OPEN },
        OR: [{ deadline: { lt: new Date() } }, { scheduledAt: { lt: startOfToday() } }],
      }),
      count({ status: "IN_PROGRESS" }),
    ]);
    return ok(res, { total, pending, today: todayCount, completed, verified, rejected, needsCorrection, overdue, inProgress });
  } catch (error) {
    next(error);
  }
};

export const getTodaySchedule = async (req, res, next) => {
  try {
    return ok(res, await list(req, { scheduledAt: { gte: startOfToday(), lte: endOfToday() }, status: { notIn: ["CANCELLED"] } }));
  } catch (error) {
    next(error);
  }
};

export const getPendingInspections = async (req, res, next) => {
  try {
    return ok(res, await list(req, { status: { in: WAITING } }));
  } catch (error) {
    next(error);
  }
};

export const getUpcomingInspections = async (req, res, next) => {
  try {
    return ok(res, await list(req, { status: { in: WAITING }, scheduledAt: { gt: endOfToday() } }, [{ scheduledAt: "asc" }], 10));
  } catch (error) {
    next(error);
  }
};

export const getRecentCompleted = async (req, res, next) => {
  try {
    return ok(res, await list(req, { status: "COMPLETED" }, [{ completedAt: "desc" }, { updatedAt: "desc" }], 5));
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------------------
// LISTS
// ------------------------------------------------------------
// Dashboard cards link here with ?status=<card key>
const statusAliases = () => ({
  total: undefined,
  pending: { status: { in: WAITING } },
  today: { scheduledAt: { gte: startOfToday(), lte: endOfToday() } },
  completed: { status: "COMPLETED" },
  verified: { status: "COMPLETED", result: "VERIFIED" },
  rejected: { OR: [{ status: "REJECTED" }, { status: "COMPLETED", result: "REJECTED" }] },
  needsCorrection: { status: "COMPLETED", result: "NEEDS_CORRECTION" },
  overdue: { status: { in: OPEN }, OR: [{ deadline: { lt: new Date() } }, { scheduledAt: { lt: startOfToday() } }] },
});
const STATUSES = ["PENDING", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "REJECTED", "CANCELLED"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const searchFilter = (search) =>
  search
    ? {
        OR: [
          { vehicle: { title: { contains: search, mode: "insensitive" } } },
          { vehicle: { registrationNumber: { contains: search, mode: "insensitive" } } },
          { vehicle: { city: { contains: search, mode: "insensitive" } } },
          { id: { endsWith: search.replace(/^INS-/i, "").toLowerCase() } },
        ],
      }
    : {};

export const getMyInspections = async (req, res, next) => {
  try {
    const status = String(req.query.status || "");
    const priority = String(req.query.priority || "").toUpperCase();
    const search = String(req.query.search || "").trim();
    const where = {
      ...(STATUSES.includes(status.toUpperCase()) ? { status: status.toUpperCase() } : statusAliases()[status] || {}),
      ...(PRIORITIES.includes(priority) ? { priority } : {}),
    };
    const s = searchFilter(search);
    const finalWhere = where.OR && s.OR ? { AND: [where, s] } : { ...where, ...s };
    const inspections = await list(req, finalWhere, [{ scheduledAt: "desc" }, { createdAt: "desc" }]);
    return ok(res, { inspections, total: inspections.length });
  } catch (error) {
    next(error);
  }
};

export const getInProgressInspections = async (req, res, next) => {
  try {
    return ok(res, await list(req, { status: "IN_PROGRESS" }, [{ startedAt: "desc" }]));
  } catch (error) {
    next(error);
  }
};

export const getCompletedInspections = async (req, res, next) => {
  try {
    return ok(res, await list(req, { status: "COMPLETED" }, [{ completedAt: "desc" }, { updatedAt: "desc" }]));
  } catch (error) {
    next(error);
  }
};

export const getInspectionById = async (req, res, next) => {
  try {
    const i = await loadMine(req, res);
    if (!i) return;
    return sendInspection(res, i.id);
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------------------
// ACCEPT / START
// ------------------------------------------------------------
export const acceptInspection = async (req, res, next) => {
  try {
    const i = await loadMine(req, res);
    if (!i) return;
    if (i.status !== "ASSIGNED") return fail(res, `Only newly assigned inspections can be accepted (this one is ${i.status.toLowerCase().replace("_", " ")})`, 409);
    await prisma.inspection.update({ where: { id: i.id }, data: { status: "ACCEPTED", acceptedAt: new Date() } });
    return sendInspection(res, i.id, "Inspection accepted");
  } catch (error) {
    next(error);
  }
};

export const startInspection = async (req, res, next) => {
  try {
    const i = await loadMine(req, res);
    if (!i) return;
    if (i.status === "IN_PROGRESS") return sendInspection(res, i.id, "Inspection already in progress");
    if (!WAITING.includes(i.status)) return fail(res, `This inspection is ${i.status.toLowerCase().replace("_", " ")} and can't be started`, 409);
    const now = new Date();
    await prisma.inspection.update({
      where: { id: i.id },
      data: { status: "IN_PROGRESS", startedAt: now, acceptedAt: i.acceptedAt || now },
    });
    return sendInspection(res, i.id, "Inspection started");
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------------------
// VERIFICATION STEPS (InspectionVerify.jsx)
// ------------------------------------------------------------
export const saveDraft = async (req, res, next) => {
  try {
    const i = await loadEditable(req, res);
    if (!i) return;
    await saveStep(i, {});
    return sendInspection(res, i.id, "Draft saved");
  } catch (error) {
    next(error);
  }
};

// body: { checks: { identity, present, phone, address, owns, authorized }, notes, status }
export const updateSellerVerification = async (req, res, next) => {
  try {
    const i = await loadEditable(req, res);
    if (!i) return;
    const checks = req.body?.checks || {};
    const allChecked = Object.keys(checks).length > 0 && Object.values(checks).every(Boolean);
    await saveStep(i, {
      checklist: withChecklist(i, {
        sellerVerified: allChecked,
        sellerChecks: checks,
        sellerNotes: String(req.body?.notes || "").trim() || null,
      }),
    });
    return sendInspection(res, i.id, "Seller verification saved");
  } catch (error) {
    next(error);
  }
};

// body: { documents: [{ documentType, documentUrl, documentNumber, status, remarks, rejectionReason }] }
export const updateDocumentVerification = async (req, res, next) => {
  try {
    const i = await loadEditable(req, res);
    if (!i) return;
    const docs = (Array.isArray(req.body?.documents) ? req.body.documents : []).map((d) => ({
      id: d.id || newId(),
      documentType: String(d.documentType || "OTHER"),
      documentUrl: d.documentUrl || null,
      documentNumber: d.documentNumber || null,
      status: ["VERIFIED", "REJECTED", "PENDING"].includes(d.status) ? d.status : "PENDING",
      remarks: d.remarks || null,
      rejectionReason: d.status === "REJECTED" ? d.rejectionReason || null : null,
    }));
    const missingReason = docs.find((d) => d.status === "REJECTED" && !d.rejectionReason);
    if (missingReason) return fail(res, `Add a rejection reason for ${missingReason.documentType}`);
    await saveStep(i, {
      documentChecks: docs,
      checklist: withChecklist(i, {
        documentsVerified: docs.length > 0 && docs.every((d) => d.status === "VERIFIED"),
        documentNotes: docs.filter((d) => d.remarks).map((d) => `${d.documentType}: ${d.remarks}`).join("; ") || null,
      }),
    });
    return sendInspection(res, i.id, "Documents saved");
  } catch (error) {
    next(error);
  }
};

const replaceCategory = (checks, category, items) => [
  ...(Array.isArray(checks) ? checks : []).filter((c) => c.category !== category),
  ...items,
];

// body: { observedRegistrationNumber, observedVin, observedEngineNumber, registrationMatch, vinMatch, engineMatch, notes, status }
export const updateVehicleIdentity = async (req, res, next) => {
  try {
    const i = await loadEditable(req, res);
    if (!i) return;
    const b = req.body || {};
    const item = (name, match, observed) => ({
      id: newId(), category: "Identity", item: name, condition: match ? "Matched" : "Mismatch",
      status: match ? "VERIFIED" : "FAILED", remarks: observed || null,
    });
    const items = [
      item("Registration Number Match", !!b.registrationMatch, b.observedRegistrationNumber),
      item("VIN/Chassis Number Match", !!b.vinMatch, b.observedVin),
      item("Engine Number Match", !!b.engineMatch, b.observedEngineNumber),
    ];
    await saveStep(i, {
      vehicleChecks: replaceCategory(i.vehicleChecks, "Identity", items),
      checklist: withChecklist(i, {
        vehicleIdentityVerified: !!(b.registrationMatch && b.vinMatch && b.engineMatch),
        identityNotes: String(b.notes || "").trim() || null,
      }),
    });
    return sendInspection(res, i.id, "Vehicle identity saved");
  } catch (error) {
    next(error);
  }
};

// body: { category: "Exterior" | "Interior" | "Mechanical", items: [{ item, condition, status, remarks }], notes }
const CHECK_CATEGORIES = { Exterior: "exterior", Interior: "interior", Mechanical: "mechanical" };
export const updateVehicleCheck = async (req, res, next) => {
  try {
    const i = await loadEditable(req, res);
    if (!i) return;
    const category = String(req.body?.category || "");
    const key = CHECK_CATEGORIES[category];
    if (!key) return fail(res, "category must be Exterior, Interior or Mechanical");
    const items = (Array.isArray(req.body?.items) ? req.body.items : []).map((c) => ({
      id: newId(),
      category,
      item: String(c.item || ""),
      condition: c.condition || null,
      status: c.condition ? "VERIFIED" : "PENDING",
      remarks: c.remarks || null,
    }));
    await saveStep(i, {
      vehicleChecks: replaceCategory(i.vehicleChecks, category, items),
      checklist: withChecklist(i, {
        [`${key}Verified`]: items.length > 0 && items.every((c) => c.condition),
        [`${key}Notes`]: String(req.body?.notes || "").trim() || null,
      }),
    });
    return sendInspection(res, i.id, `${category} check saved`);
  } catch (error) {
    next(error);
  }
};

// body: { completed, rating, notes, reasonIfSkipped }
export const updateTestDrive = async (req, res, next) => {
  try {
    const i = await loadEditable(req, res);
    if (!i) return;
    const b = req.body || {};
    const completed = b.completed === true || b.completed === "true";
    if (!completed && !String(b.reasonIfSkipped || "").trim()) return fail(res, "Give a reason for skipping the test drive");
    const rating = Math.max(0, Math.min(5, Number(b.rating) || 0));
    const item = {
      id: newId(), category: "TestDrive", item: "Test Drive",
      condition: completed ? `${rating}/5` : "Skipped",
      status: completed ? "VERIFIED" : "SKIPPED",
      remarks: completed ? `Rating: ${rating}/5` : String(b.reasonIfSkipped).trim(),
    };
    await saveStep(i, {
      vehicleChecks: replaceCategory(i.vehicleChecks, "TestDrive", [item]),
      checklist: withChecklist(i, { testDriveCompleted: completed, testDriveNotes: String(b.notes || "").trim() || null }),
    });
    return sendInspection(res, i.id, "Test drive saved");
  } catch (error) {
    next(error);
  }
};

// body: { actualAddress, actualLatitude, actualLongitude, locationMatched, vehiclePresent, sellerPresent, remarks }
export const updateLocation = async (req, res, next) => {
  try {
    const i = await loadEditable(req, res);
    if (!i) return;
    const b = req.body || {};
    const num = (v) => (v === null || v === undefined || v === "" ? null : Number(v));
    const locationCheck = {
      actualAddress: String(b.actualAddress || "").trim() || null,
      actualLatitude: num(b.actualLatitude),
      actualLongitude: num(b.actualLongitude),
      locationMatched: !!b.locationMatched,
      vehiclePresent: !!b.vehiclePresent,
      sellerPresent: !!b.sellerPresent,
      remarks: String(b.remarks || "").trim() || null,
    };
    await saveStep(i, {
      locationCheck,
      checklist: withChecklist(i, {
        locationVerified: locationCheck.locationMatched && locationCheck.vehiclePresent,
        locationNotes: locationCheck.remarks,
      }),
    });
    return sendInspection(res, i.id, "Location saved");
  } catch (error) {
    next(error);
  }
};

// multipart: photos[] + category
export const uploadPhotos = async (req, res, next) => {
  try {
    const i = await loadEditable(req, res);
    if (!i) return;
    const files = req.files?.photos || [];
    if (!files.length) return fail(res, "Choose at least one photo");
    const category = String(req.body?.category || "Other");
    const added = [];
    for (const f of files) {
      const imageUrl = await storeUpload(f, "vehiclehub/inspections", req);
      if (imageUrl) added.push({ id: newId(), imageUrl, category, uploadedAt: new Date().toISOString() });
    }
    const photos = [...(Array.isArray(i.photos) ? i.photos : []), ...added];
    await saveStep(i, { photos, checklist: withChecklist(i, { photosCompleted: photos.length > 0 }) });
    return sendInspection(res, i.id, `${added.length} photo${added.length === 1 ? "" : "s"} uploaded`);
  } catch (error) {
    next(error);
  }
};

export const deletePhoto = async (req, res, next) => {
  try {
    const i = await loadEditable(req, res);
    if (!i) return;
    const photos = (Array.isArray(i.photos) ? i.photos : []).filter((p) => p.id !== req.params.photoId);
    await saveStep(i, { photos, checklist: withChecklist(i, { photosCompleted: photos.length > 0 }) });
    return sendInspection(res, i.id, "Photo removed");
  } catch (error) {
    next(error);
  }
};

// body: { result: VERIFIED | REJECTED | NEEDS_CORRECTION, finalRating, finalNotes, rejectionReason, correctionReason }
export const submitInspection = async (req, res, next) => {
  try {
    const i = await loadEditable(req, res);
    if (!i) return;
    const b = req.body || {};
    const result = String(b.result || "").toUpperCase();
    if (!["VERIFIED", "REJECTED", "NEEDS_CORRECTION"].includes(result)) return fail(res, "Choose a result: Verified, Rejected or Needs correction");
    const rejectionReason = String(b.rejectionReason || "").trim() || null;
    const correctionReason = String(b.correctionReason || "").trim() || null;
    if (result === "REJECTED" && !rejectionReason) return fail(res, "Add a rejection reason");
    if (result === "NEEDS_CORRECTION" && !correctionReason) return fail(res, "Describe what the seller needs to correct");
    const finalRating = b.finalRating ? Math.max(1, Math.min(5, Number(b.finalRating))) : null;
    const finalNotes = String(b.finalNotes || "").trim() || null;
    const now = new Date();

    const vehicle = await prisma.vehicle.findUnique({ where: { id: i.vehicleId }, select: { id: true, title: true, sellerId: true } });
    await prisma.$transaction(async (tx) => {
      await tx.inspection.update({
        where: { id: i.id },
        data: {
          status: "COMPLETED",
          result,
          approved: result === "VERIFIED",
          finalRating,
          finalNotes,
          rejectionReason: result === "REJECTED" ? rejectionReason : null,
          correctionReason: result === "NEEDS_CORRECTION" ? correctionReason : null,
          completedAt: now,
          startedAt: i.startedAt || now,
          report: finalNotes || rejectionReason || correctionReason || null,
        },
      });
      if (result === "VERIFIED") {
        await tx.vehicle.update({ where: { id: i.vehicleId }, data: { isVerified: true, inspectionDate: now, inspectionRemarks: finalNotes } });
      } else {
        await tx.vehicle.update({ where: { id: i.vehicleId }, data: { inspectionDate: now, inspectionRemarks: rejectionReason || correctionReason } });
      }

      const label = { VERIFIED: "passed field verification", REJECTED: "failed field verification", NEEDS_CORRECTION: "needs corrections after inspection" }[result];
      const message = `${vehicle?.title || "Vehicle"} ${label}${rejectionReason || correctionReason ? `: ${rejectionReason || correctionReason}` : "."}`;
      const admins = await tx.user.findMany({ where: { role: "ADMIN", isActive: true }, select: { id: true } });
      const notify = [
        ...(vehicle?.sellerId ? [vehicle.sellerId] : []),
        ...admins.map((a) => a.id),
      ];
      if (notify.length) {
        await tx.notification.createMany({
          data: notify.map((userId) => ({
            userId,
            type: "SYSTEM_ALERT",
            title: `Inspection ${inspectionNo(i)} completed`,
            message,
            metadata: { inspectionId: i.id, vehicleId: i.vehicleId, result },
          })),
        });
      }
      await tx.activityLog.create({
        data: { userId: req.user.id, action: "inspection.completed", entityType: "Inspection", entityId: i.id, metadata: { result, vehicleId: i.vehicleId } },
      });
    });
    return sendInspection(res, i.id, "Inspection submitted");
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------------------
// REPORTS + CALENDAR
// ------------------------------------------------------------
export const getReports = async (req, res, next) => {
  try {
    const result = String(req.query.result || "").toUpperCase();
    const search = String(req.query.search || "").trim();
    const where = { status: "COMPLETED", ...(["VERIFIED", "REJECTED", "NEEDS_CORRECTION"].includes(result) ? { result } : {}), ...searchFilter(search) };
    return ok(res, await list(req, where, [{ completedAt: "desc" }, { updatedAt: "desc" }]));
  } catch (error) {
    next(error);
  }
};

export const getReportById = getInspectionById;

export const getCalendar = async (req, res, next) => {
  try {
    const now = new Date();
    const month = Math.min(12, Math.max(1, Number(req.query.month) || now.getMonth() + 1));
    const year = Number(req.query.year) || now.getFullYear();
    const from = new Date(year, month - 1, 1);
    const to = new Date(year, month, 0, 23, 59, 59, 999);
    const status = String(req.query.status || "").toUpperCase();
    const priority = String(req.query.priority || "").toUpperCase();
    return ok(res, await list(req, {
      scheduledAt: { gte: from, lte: to },
      ...(STATUSES.includes(status) ? { status } : {}),
      ...(PRIORITIES.includes(priority) ? { priority } : {}),
    }));
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------------------
// NOTIFICATIONS
// ------------------------------------------------------------
export const getNotifications = async (req, res, next) => {
  try {
    const [rows, unreadCount] = await Promise.all([
      prisma.notification.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: "desc" }, take: 100 }),
      prisma.notification.count({ where: { userId: req.user.id, isRead: false } }),
    ]);
    const notifications = rows.map((n) => ({ ...n, inspectionId: n.metadata?.inspectionId || null }));
    return ok(res, { notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({ where: { id: req.params.id, userId: req.user.id }, data: { isRead: true } });
    return ok(res, null, "Notification marked as read");
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    const { count } = await prisma.notification.updateMany({ where: { userId: req.user.id, isRead: false }, data: { isRead: true } });
    return ok(res, { updated: count }, "All notifications marked as read");
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------------------
// PROFILE
// ------------------------------------------------------------
const profileSelect = { id: true, fullName: true, lastName: true, email: true, phone: true, avatar: true, role: true, createdAt: true };

export const getProfile = async (req, res, next) => {
  try {
    const [user, total, completed, verified] = await Promise.all([
      prisma.user.findUnique({ where: { id: req.user.id }, select: profileSelect }),
      prisma.inspection.count({ where: { inspectorId: req.user.id } }),
      prisma.inspection.count({ where: { inspectorId: req.user.id, status: "COMPLETED" } }),
      prisma.inspection.count({ where: { inspectorId: req.user.id, status: "COMPLETED", result: "VERIFIED" } }),
    ]);
    if (!user) return fail(res, "User not found", 404);
    return ok(res, { ...user, stats: { total, completed, verified } });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const fullName = String(req.body?.fullName ?? "").trim();
    if (!fullName) return fail(res, "Full name is required");
    const data = { fullName };
    const phone = String(req.body?.phone ?? "").trim();
    if (phone) {
      const taken = await prisma.user.findFirst({ where: { phone, NOT: { id: req.user.id } }, select: { id: true } });
      if (taken) return fail(res, "This phone number is already used by another account", 409);
      data.phone = phone;
    }
    const user = await prisma.user.update({ where: { id: req.user.id }, data, select: profileSelect });
    return ok(res, user, "Profile updated");
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!newPassword || String(newPassword).length < 8) return fail(res, "New password must be at least 8 characters");
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { password: true } });
    if (user?.password) {
      const valid = await bcrypt.compare(String(currentPassword || ""), user.password);
      if (!valid) return fail(res, "Current password is incorrect", 400);
    }
    await prisma.user.update({ where: { id: req.user.id }, data: { password: await bcrypt.hash(String(newPassword), 10) } });
    return ok(res, null, "Password changed");
  } catch (error) {
    next(error);
  }
};