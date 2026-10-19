// VehicleHub/VehicleHub_Server/src/routes/contactUs.routes.js
// Public (no sign-in needed). Mounted at /api/contact-us:
//   app.use("/api/contact-us", contactUsRoutes);
//
//   POST /api/contact-us          { name, email, message }  Contact Us page
//   POST /api/contact-us/ticket   { name, email, message }  footer "Raise a Ticket"
import express from "express";
import rateLimit from "express-rate-limit";
import { submitContactForm, raiseTicket } from "../controllers/contactUs.controller.js";

const router = express.Router();

// Stops the forms being used to flood the mailboxes: 10 submissions per 15 minutes per IP
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many messages from your network. Please wait a few minutes and try again." },
});

router.post("/", contactLimiter, submitContactForm);
router.post("/ticket", contactLimiter, raiseTicket);

export default router;