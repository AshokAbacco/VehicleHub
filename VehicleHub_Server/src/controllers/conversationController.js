// VehicleHub/VehicleHub_Server/src/controllers/conversationController.js
// ============================================================
// The signed-in user's own conversations (used by the seller messages window).
// Mounted at /api/conversations — any logged-in user, only conversations they take part in.
//   GET   /api/conversations                     -> { success, data: { conversations, unreadCount } }
//   POST  /api/conversations/:id/messages  { text }
//   PATCH /api/conversations/:id/read
// (Admins use /api/admin/conversations.)
// ============================================================
import { prisma } from "../config/db.js";

const ok = (res, data, message = "OK", status = 200) => res.status(status).json({ success: true, message, data });
const fail = (res, message, status = 400) => res.status(status).json({ success: false, message });

const ROLE_LABEL = { SELLER: "Seller", DEALER: "Dealer", BUYER: "Buyer", INSPECTOR: "Field Inspector", ADMIN: "VehicleHub Admin" };

export const getMyConversations = async (req, res, next) => {
  try {
    const me = req.user.id;
    const rows = await prisma.conversation.findMany({
      where: { participants: { some: { userId: me } } },
      orderBy: { updatedAt: "desc" },
      include: {
        participants: { include: { user: { select: { id: true, fullName: true, email: true, role: true, sellerProfile: { select: { businessName: true } } } } } },
        messages: { orderBy: { createdAt: "asc" } },
      },
    });

    // Conversation.vehicleId has no relation — look the titles up in one query
    const vehicleIds = [...new Set(rows.map((c) => c.vehicleId).filter(Boolean))];
    const vehicles = vehicleIds.length
      ? await prisma.vehicle.findMany({ where: { id: { in: vehicleIds } }, select: { id: true, title: true } })
      : [];
    const titleOf = Object.fromEntries(vehicles.map((v) => [v.id, v.title]));

    const conversations = rows.map((c) => {
      const other = c.participants.map((p) => p.user).find((u) => u && u.id !== me);
      const mine = c.participants.find((p) => p.userId === me);
      const unread = c.messages.filter((m) => m.senderId !== me && (!mine?.lastReadAt || m.createdAt > mine.lastReadAt)).length;
      return {
        id: c.id,
        otherUserId: other?.id || null,
        otherName: other?.role === "ADMIN" ? "VehicleHub Admin" : other?.sellerProfile?.businessName || other?.fullName || other?.email || "User",
        otherRole: ROLE_LABEL[other?.role] || "User",
        vehicleId: c.vehicleId,
        vehicle: titleOf[c.vehicleId] || null,
        unread,
        updatedAt: c.updatedAt,
        messages: c.messages.map((m) => ({ id: m.id, mine: m.senderId === me, text: m.text, time: m.createdAt })),
      };
    });
    return ok(res, { conversations, unreadCount: conversations.reduce((s, c) => s + c.unread, 0) });
  } catch (error) {
    next(error);
  }
};

export const sendMyMessage = async (req, res, next) => {
  try {
    const text = String(req.body?.text || "").trim();
    if (!text) return fail(res, "Message can't be empty");
    if (text.length > 2000) return fail(res, "Message is too long");
    const convo = await prisma.conversation.findFirst({ where: { id: req.params.id, participants: { some: { userId: req.user.id } } } });
    if (!convo) return fail(res, "Conversation not found", 404);

    const now = new Date();
    const message = await prisma.message.create({
      data: { conversationId: convo.id, senderId: req.user.id, senderType: req.user.role === "ADMIN" ? "ADMIN" : "USER", text },
    });
    await prisma.conversation.update({ where: { id: convo.id }, data: { updatedAt: now } });
    await prisma.conversationParticipant.updateMany({ where: { conversationId: convo.id, userId: req.user.id }, data: { lastReadAt: now } });

    const others = await prisma.conversationParticipant.findMany({ where: { conversationId: convo.id, NOT: { userId: req.user.id } }, select: { userId: true } });
    if (others.length) {
      await prisma.notification.createMany({
        data: others.map((o) => ({
          userId: o.userId,
          type: "NEW_MESSAGE",
          title: `New message from ${req.user.fullName || "a VehicleHub user"}`,
          message: text.slice(0, 140),
          metadata: { conversationId: convo.id },
        })),
      });
    }
    return ok(res, { id: message.id, mine: true, text: message.text, time: message.createdAt }, "Message sent", 201);
  } catch (error) {
    next(error);
  }
};

export const markMyConversationRead = async (req, res, next) => {
  try {
    const { count } = await prisma.conversationParticipant.updateMany({
      where: { conversationId: req.params.id, userId: req.user.id },
      data: { lastReadAt: new Date() },
    });
    if (!count) return fail(res, "Conversation not found", 404);
    return ok(res, null, "Conversation marked as read");
  } catch (error) {
    next(error);
  }
};