const { prisma } = require('../config/db');

class BrandModel {
  async create(data) { return prisma.brand.create({ data }); }
  async findAll() { return prisma.brand.findMany({ orderBy: { createdAt: 'desc' } }); }
  async findById(id) { return prisma.brand.findUnique({ where: { id } }); }
  async update(id, data) { return prisma.brand.update({ where: { id }, data }); }
  async delete(id) { return prisma.brand.delete({ where: { id } }); }
}

module.exports = new BrandModel();
