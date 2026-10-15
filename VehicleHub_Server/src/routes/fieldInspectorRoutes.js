// VehicleHub/VehicleHub_Server/src/routes/fieldInspectorRoutes.js
// Mounted at /api/field-inspector (routes/index.js). Field Inspectors (role INSPECTOR) only.
import { Router } from "express";
import { authenticateUser, requireAuth, authorizeRoles } from "../middleware/authMiddleware.js";
import { uploadFields } from "../middleware/uploadMiddleware.js";
import * as fi from "../controllers/fieldInspectorController.js";

const router = Router();
router.use(authenticateUser, requireAuth, authorizeRoles("INSPECTOR"));

// Dashboard
router.get("/dashboard/inspector", fi.getDashboardStats);
router.get("/dashboard/today-schedule", fi.getTodaySchedule);
router.get("/dashboard/pending-inspections", fi.getPendingInspections);
router.get("/dashboard/upcoming-inspections", fi.getUpcomingInspections);
router.get("/dashboard/recent-completed", fi.getRecentCompleted);

// Lists (fixed paths before "/inspections/:id")
router.get("/inspections/my-inspections", fi.getMyInspections);
router.get("/inspections/in-progress", fi.getInProgressInspections);
router.get("/inspections/completed", fi.getCompletedInspections);
router.get("/inspections/:id", fi.getInspectionById);

// Workflow
router.post("/inspections/:id/accept", fi.acceptInspection);
router.post("/inspections/:id/start", fi.startInspection);
router.patch("/inspections/:id/draft", fi.saveDraft);
router.patch("/inspections/:id/seller-verification", fi.updateSellerVerification);
router.patch("/inspections/:id/document-verification", fi.updateDocumentVerification);
router.patch("/inspections/:id/vehicle-identity", fi.updateVehicleIdentity);
router.patch("/inspections/:id/vehicle-check", fi.updateVehicleCheck);
router.patch("/inspections/:id/test-drive", fi.updateTestDrive);
router.patch("/inspections/:id/location", fi.updateLocation);
router.post("/inspections/:id/photos", uploadFields([{ name: "photos", maxCount: 20 }]), fi.uploadPhotos);
router.delete("/inspections/:id/photos/:photoId", fi.deletePhoto);
router.post("/inspections/:id/submit", fi.submitInspection);

// Reports + calendar
router.get("/reports", fi.getReports);
router.get("/reports/:id", fi.getReportById);
router.get("/calendar", fi.getCalendar);

// Notifications ("/notifications/read" = mark all)
router.get("/notifications", fi.getNotifications);
router.post("/notifications/read", fi.markAllNotificationsRead);
router.post("/notifications/:id/read", fi.markNotificationRead);

// Profile
router.get("/profile", fi.getProfile);
router.patch("/profile", fi.updateProfile);
router.post("/profile/change-password", fi.changePassword);

export default router;