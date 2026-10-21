// VehicleHub/VehicleHub/src/utils/listingVerification.js
// A seller can publish a vehicle as "Unverified" (live without admin review). It shows an
// Unverified badge until the admin verifies it (or a field inspection passes).
export const isUnverifiedListing = (vehicle) =>
    String(vehicle?.verificationOption || '').toUpperCase() === 'UNVERIFIED' && !vehicle?.isVerified;

// MotorDesk "Verified" badge shown on verified vehicle cards
export const VERIFIED_BADGE_URL =
    'https://pub-0d3b6101b0ef4fb8a7fa224504366fbf.r2.dev/products/The%20MotorDesk%20Verified%20Badge.png';