import { prisma } from "../config/db.js";

class InquiryModel {
  async create(data) {
    return prisma.inquiry.create({ data });
  }
  async findByUser(buyerId) {
    return prisma.inquiry.findMany({
      where: { buyerId },
      orderBy: { createdAt: "desc" },
    });
  }
  async update(id, data) {
    return prisma.inquiry.update({ where: { id }, data });
  }
}

export default new InquiryModel();
