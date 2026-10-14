import { prisma } from "../config/db.js";

class FinanceModel {
  async createLoan(data) {
    return prisma.loan.create({ data });
  }
  async findLoansByUser(userId) {
    return prisma.loan.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }
  async updateLoan(id, data) {
    return prisma.loan.update({ where: { id }, data });
  }
}

export default new FinanceModel();
