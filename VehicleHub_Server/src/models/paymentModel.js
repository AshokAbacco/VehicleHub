const { prisma } = require('../config/db');

class PaymentModel {
  async create(data) { return prisma.payment.create({ data }); }
  async findByUser(userId) { return prisma.payment.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }); }
  async update(id, data) { return prisma.payment.update({ where: { id }, data }); }
}

module.exports = new PaymentModel();
