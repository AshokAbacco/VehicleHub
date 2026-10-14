// VehicleHub/VehicleHub_Server/src/controllers/sellerInspectionController.js
// ============================================================
// SELLER > Inspection Requests — mounted in routes/sellerRoutes.js
//   GET /api/sellers/inspection-requests       -> { success, data: [...] }
//   GET /api/sellers/inspection-requests/:id   -> { success, data: {...} }
// Field inspections of the logged-in seller's vehicles (admins see all).
// Shapes match VehicleHub/src/components/seller/InspectionRequestsPage.jsx.
//
// The Inspection table stores: status, inspector, scheduledAt, approved and a
// free-text `report`. If an inspector app saves a structured report as JSON in
// `report` ({ checklist, documents, vehicleChecks, location, photos, finalRating,
// finalNotes }), those sections are returned too; otherwise `report` is used as
// the final notes and the other sections stay empty.
// ============================================================
import { prisma } from "../config/db.js";

const isAdmin = (user) => ["ADMIN", "SUPER_ADMIN"].includes(user?.role);
const ownVehicles = (user) => (isAdmin(user) ? {} : { vehicle: { sellerId: user.id } });

const vehicleSelect = {
  id: true, title: true, brand: true, model: true, variant: true, year: true,
  registrationNumber: true, fuelType: true, mileage: true, price: true, images: true,
  location: true, city: true, state: true, pincode: true, vehicleType: true,
  category: { select: { name: true } },
};
const inspectorSelect = { id: true, fullName: true, phone: true, email: true };

const toListing = (v) =>
  v && {
    ...v,
    category: v.category?.name || v.vehicleType || null,
    manufacturingYear: v.year,
    kmDriven: v.mileage,
  };

const parseReport = (report) => {
  if (!report) return {};
  try {
    const parsed = JSON.parse(report);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : { finalNotes: report };
  } catch {
    return { finalNotes: report };
  }
};

const resultFor = (i) => {
  if (i.status === "COMPLETED") return i.approved ? "PASSED" : "FAILED";
  if (i.status === "REJECTED") return "REJECTED";
  return null;
};

const toListItem = (i) => ({
  id: i.id,
  inspectionNo: `INS-${i.id.slice(-6).toUpperCase()}`,
  status: i.status,
  approved: i.approved,
  scheduledDate: i.scheduledAt,
  assignedAt: i.inspectorId ? i.updatedAt : null,
  createdAt: i.createdAt,
  vehicleListingId: i.vehicleId,
  vehicleListing: toListing(i.vehicle),
  inspector: i.inspector || null,
});

export const getSellerInspections = async (req, res, next) => {
  try {
    const rows = await prisma.inspection.findMany({
      where: ownVehicles(req.user),
      orderBy: [{ scheduledAt: "desc" }, { createdAt: "desc" }],
      include: { vehicle: { select: vehicleSelect }, inspector: { select: inspectorSelect } },
    });
    return res.json({ success: true, data: rows.map(toListItem) });
  } catch (error) {
    next(error);
  }
};

export const getSellerInspectionById = async (req, res, next) => {
  try {
    const i = await prisma.inspection.findFirst({
      where: { id: req.params.id, ...ownVehicles(req.user) },
      include: { vehicle: { select: vehicleSelect }, inspector: { select: inspectorSelect } },
    });
    if (!i) return res.status(404).json({ success: false, message: "Inspection not found" });

    const report = parseReport(i.report);
    const v = i.vehicle;
    const expectedAddress = [v?.location, v?.city, v?.state, v?.pincode].filter(Boolean).join(", ") || null;

    return res.json({
      success: true,
      data: {
        ...toListItem(i),
        checklist: report.checklist || null,
        documents: Array.isArray(report.documents) ? report.documents : [],
        vehicleChecks: Array.isArray(report.vehicleChecks) ? report.vehicleChecks : [],
        photos: Array.isArray(report.photos) ? report.photos : [],
        location: { expectedAddress, ...(report.location || {}) },
        result: report.result || resultFor(i),
        finalRating: report.finalRating ?? null,
        finalNotes: report.finalNotes || null,
        rejectionReason: i.status === "REJECTED" ? report.rejectionReason || report.finalNotes || null : null,
        completedAt: i.status === "COMPLETED" ? report.completedAt || i.updatedAt : null,
      },
    });
  } catch (error) {
    next(error);
  }
};