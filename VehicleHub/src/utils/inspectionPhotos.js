// VehicleHub/VehicleHub/src/utils/inspectionPhotos.js
// Shared by the Field Inspector verification pages. The backend checks the same minimum
// (VehicleHub_Server/src/controllers/fieldInspectorController.js).

// Exterior, Interior and Engine & Mechanical each need at least this many photos
export const MIN_STEP_PHOTOS = 8;

// Photos of one verification step. Photos without a step (uploaded before steps were added)
// belong to "Photos & Evidence".
export const photosForStep = (photos, step) => (photos || []).filter((p) => (p.step || 'evidence') === step);