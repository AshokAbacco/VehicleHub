import express from "express";
import * as financeController from "../controllers/financeController.js";
import {
  authenticateUser,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/apply", authenticateUser, financeController.applyLoan);
router.patch(
  "/:id/approve",
  authenticateUser,
  authorizeRoles("FINANCE", "ADMIN", "SUPER_ADMIN"),
  financeController.approveLoan,
);
router.patch(
  "/:id/reject",
  authenticateUser,
  authorizeRoles("FINANCE", "ADMIN", "SUPER_ADMIN"),
  financeController.rejectLoan,
);
router.get("/:id", authenticateUser, financeController.loanDetails);
router.get("/:id/emi", authenticateUser, financeController.loanEMI);

export default router;
