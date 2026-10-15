// VehicleHub/VehicleHub_Server/src/routes/conversationRoutes.js
// Mounted at /api/conversations — the signed-in user's own conversations.
import { Router } from "express";
import { authenticateUser, requireAuth } from "../middleware/authMiddleware.js";
import { getMyConversations, sendMyMessage, markMyConversationRead } from "../controllers/conversationController.js";

const router = Router();
router.use(authenticateUser, requireAuth);

router.get("/", getMyConversations);
router.post("/:id/messages", sendMyMessage);
router.patch("/:id/read", markMyConversationRead);

export default router;