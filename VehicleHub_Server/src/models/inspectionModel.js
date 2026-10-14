import { prisma } from "../config/db.js";

class InspectionModel {
  async create(data) {
    return prisma.inspection.create({ data });
  }
  async update(id, data) {
    return prisma.inspection.update({ where: { id }, data });
  }
  async findAll() {
    return prisma.inspection.findMany({ orderBy: { createdAt: "desc" } });
  }
}

export default new InspectionModel();
