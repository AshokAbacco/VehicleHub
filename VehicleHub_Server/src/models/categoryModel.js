const { prisma } = require('../config/db');

class CategoryModel {
  async create(data) { return prisma.category.create({ data }); }
  async findAll() { return prisma.category.findMany({ orderBy: { createdAt: 'desc' } }); }
  async findById(id) { return prisma.category.findUnique({ where: { id } }); }
  async update(id, data) { return prisma.category.update({ where: { id }, data }); }
  async delete(id) { return prisma.category.delete({ where: { id } }); }
}

module.exports = new CategoryModel();
