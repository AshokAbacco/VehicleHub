import { prisma } from "../config/db.js";

class PaymentService {
  async createPayment(payload) {
    return prisma.payment.create({ data: payload });
  }

  async getPaymentsByUser(userId) {
    return prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }
}

export default new PaymentService();
