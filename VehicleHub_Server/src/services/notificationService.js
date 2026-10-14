import { prisma } from "../config/db.js";

class NotificationService {
  async createNotification(payload) {
    return prisma.notification.create({ data: payload });
  }

  async getNotifications(userId) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }
}

export default new NotificationService();
