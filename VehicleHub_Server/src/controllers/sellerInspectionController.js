// VehicleHub/VehicleHub_Server/src/controllers/sellerInspectionController.js
// ============================================================
// SELLER > Inspection Requests — mounted in routes/sellerRoutes.js
//   GET /api/sellers/inspection-requests       -> { success, data: [...] }
//   GET /api/sellers/inspection-requests/:id   -> { success, data: {...} }
// Field inspections of the logged-in seller's vehicles (admins see all).
// The report sections are filled in by the field inspector (fieldInspectorController.js).
// ============================================================
import { prisma } from "../config/db.js";
import { inspectionInclude, toInspectionDTO } from "../utils/inspectionDto.js";

const ownVehicles = (user) => (user?.role === "ADMIN" ? {} : { vehicle: { sellerId: user.id } });

export const getSellerInspections = async (req, res, next) => {
  try {
    const rows = await prisma.inspection.findMany({
      where: ownVehicles(req.user),
      orderBy: [{ scheduledAt: "desc" }, { createdAt: "desc" }],
      include: inspectionInclude,
    });
    return res.json({ success: true, data: rows.map((i) => toInspectionDTO(i)) });
  } catch (error) {
    next(error);
  }
};

export const getSellerInspectionById = async (req, res, next) => {
  try {
    const i = await prisma.inspection.findFirst({
      where: { id: req.params.id, ...ownVehicles(req.user) },
      include: inspectionInclude,
    });
    if (!i) return res.status(404).json({ success: false, message: "Inspection not found" });
    return res.json({ success: true, data: toInspectionDTO(i) });
  } catch (error) {
    next(error);
  }
};