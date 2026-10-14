import { prisma } from "../config/db.js";

class WishlistModel {
  async add(data) {
    return prisma.wishlist.create({ data });
  }
  async findByUser(userId) {
    return prisma.wishlist.findMany({
      where: { userId },
      include: { vehicle: true },
    });
  }
  async remove(userId, vehicleId) {
    return prisma.wishlist.deleteMany({ where: { userId, vehicleId } });
  }
}

export default new WishlistModel();
