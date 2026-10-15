// VehicleHub/VehicleHub_Server/src/utils/inspectionDto.js
// Shape of an Inspection for the Field Inspector, Seller and Admin pages.
import { toVehicleDTO } from "./vehicleDto.js";

export const inspectionNo = (i) => `INS-${String(i.id).slice(-6).toUpperCase()}`;

// Prisma include used everywhere an inspection is shown
export const inspectionInclude = {
  vehicle: {
    include: {
      category: { select: { id: true, name: true } },
      seller: {
        select: {
          id: true, fullName: true, phone: true, email: true,
          sellerProfile: { select: { businessName: true, ownerName: true, sellerType: true, verificationStatus: true } },
        },
      },
    },
  },
  inspector: { select: { id: true, fullName: true, phone: true, email: true } },
};

const asArray = (v) => (Array.isArray(v) ? v : []);

// Older rows kept a free-text report (or a JSON string) in `report`
const legacyReport = (report) => {
  if (!report) return {};
  try {
    const parsed = JSON.parse(report);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : { finalNotes: report };
  } catch {
    return { finalNotes: report };
  }
};

export const resultFor = (i) => {
  if (i.result) return i.result;
  if (i.status === "COMPLETED") return i.approved ? "VERIFIED" : "REJECTED";
  if (i.status === "REJECTED") return "REJECTED";
  return "PENDING";
};

export const toInspectionDTO = (i, { assignedBy } = {}) => {
  const legacy = legacyReport(i.report);
  const vehicle = i.vehicle ? toVehicleDTO(i.vehicle) : null;
  const seller = i.vehicle?.seller || null;
  const expectedAddress = [vehicle?.location, vehicle?.city, vehicle?.state, vehicle?.pincode].filter(Boolean).join(", ") || null;
  const location = { expectedAddress, ...(legacy.location || {}), ...(i.locationCheck || {}) };
  return {
    id: i.id,
    inspectionNo: inspectionNo(i),
    status: i.status,
    priority: i.priority || "MEDIUM",
    approved: i.approved,
    result: resultFor(i),
    scheduledDate: i.scheduledAt,
    scheduledAt: i.scheduledAt,
    deadline: i.deadline,
    assignedAt: i.assignedAt || (i.inspectorId ? i.createdAt : null),
    assignedBy: assignedBy || null,
    acceptedAt: i.acceptedAt,
    startedAt: i.startedAt,
    completedAt: i.completedAt || (i.status === "COMPLETED" ? i.updatedAt : null),
    createdAt: i.createdAt,
    updatedAt: i.updatedAt,

    vehicleListingId: i.vehicleId,
    vehicleListing: vehicle,
    seller: seller
      ? {
          id: seller.id,
          fullName: seller.sellerProfile?.businessName || seller.fullName || seller.sellerProfile?.ownerName || null,
          phone: seller.phone,
          email: seller.email,
        }
      : null,
    inspector: i.inspector || null,

    checklist: i.checklist || legacy.checklist || null,
    documents: asArray(i.documentChecks).length ? asArray(i.documentChecks) : asArray(legacy.documents),
    vehicleChecks: asArray(i.vehicleChecks).length ? asArray(i.vehicleChecks) : asArray(legacy.vehicleChecks),
    photos: asArray(i.photos).length ? asArray(i.photos) : asArray(legacy.photos),
    location,
    finalRating: i.finalRating ?? legacy.finalRating ?? null,
    finalNotes: i.finalNotes || legacy.finalNotes || null,
    rejectionReason: i.rejectionReason || (i.status === "REJECTED" ? legacy.finalNotes || null : null),
    correctionReason: i.correctionReason || null,
  };
};