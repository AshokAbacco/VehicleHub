const { prisma } = require('../config/db');

class NotificationModel {
  async create(data) { return prisma.notification.create({ data }); }
  async findByUser(userId) { return prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }); }
  async markRead(id) { return prisma.notification.update({ where: { id }, data: { isRead: true } }); }
}

module.exports = new NotificationModel();
