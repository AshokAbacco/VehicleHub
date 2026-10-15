// VehicleHub/VehicleHub_Server/src/utils/vehicleDto.js
// One place that turns a Vehicle row into what the frontend pages read.
// The Add/Edit Vehicle forms use names like kmDriven / manufacturingYear / sellerName,
// while the database uses mileage / year / ownerName — every API returns both.

const isFuture = (d) => Boolean(d) && new Date(d).getTime() > Date.now();

export const toVehicleDTO = (v) => {
  if (!v) return v;
  const { category, seller, ...rest } = v;
  const profile = seller?.sellerProfile;
  const profileType = profile?.sellerType === "DEALER" ? "Dealer" : profile?.sellerType === "INDIVIDUAL" ? "Individual" : null;
  return {
    ...rest,
    category: category?.name || v.vehicleType || null,
    categoryId: v.categoryId,

    // Seller (listing contact first, then the seller's account / business profile)
    sellerName: v.ownerName || profile?.businessName || profile?.ownerName || seller?.fullName || null,
    sellerBusinessName: profile?.businessName || null,
    sellerVerified: profile ? profile.verificationStatus === "APPROVED" : undefined,
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
    documents: v.documentImages || [],
  };
};

// Vehicle.status -> simple stage name used by tables ("live" = on sale)
export const vehicleStage = (v) => {
  if (v.status === "SOLD") return "sold";
  if (v.status === "REJECTED") return "rejected";
  if (v.status === "DRAFT") return "draft";
  if (v.status === "ARCHIVED") return "archived";
  if (v.status === "PENDING") return "pending";
  return v.isApproved ? "live" : "pending";
};

export const CATEGORY_EMOJI = {
  car: "🚗",
  bike: "🏍️",
  scooter: "🛵",
  truck: "🚚",
  bus: "🚌",
  auto: "🛺",
  tractor: "🚜",
  "commercial vehicle": "🚐",
};
export const categoryEmoji = (name) => CATEGORY_EMOJI[String(name || "").toLowerCase()] || "🚘";