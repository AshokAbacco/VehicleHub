const { prisma } = require('../config/db');

class VehicleModel {
  async create(data) {
    return prisma.vehicle.create({ data });
  }

  async findAll(where = {}, options = {}) {
    return prisma.vehicle.findMany({ where, ...options });
  }

  async findById(id) {
    return prisma.vehicle.findUnique({ where: { id } });
  }

  async update(id, data) {
    return prisma.vehicle.update({ where: { id }, data });
  }

  async delete(id) {
    return prisma.vehicle.delete({ where: { id } });
  }
}

module.exports = new VehicleModel();
