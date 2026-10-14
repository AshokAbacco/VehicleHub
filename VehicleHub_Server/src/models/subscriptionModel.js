import { prisma } from "../config/db.js";

class SubscriptionModel {
  async create(data) {
    return prisma.subscription.create({ data });
  }
  async findByUser(userId) {
    return prisma.subscription.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }
  async update(id, data) {
    return prisma.subscription.update({ where: { id }, data });
  }
}

export default new SubscriptionModel();
