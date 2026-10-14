// services/vehicleService.js
import { prisma } from "../config/db.js";
import { paginate } from "../utils/pagination.js";

const slugify = (title = "") =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") +
  "-" +
  Date.now().toString(36);

class VehicleService {
  async createVehicle(payload) {
    return prisma.vehicle.create({
      data: { ...payload, slug: slugify(payload.title) },
    });
  }

  async getAllVehicles(query = {}) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);
    const where = {};

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { brand: { contains: query.search, mode: "insensitive" } },
        { model: { contains: query.search, mode: "insensitive" } },
      ];
    }

    // Public listing by default: only approved vehicles that are on sale.
    // "APPROVED" / "LIVE" / no status = live listings (approve sets status AVAILABLE).
    // Any other status (PENDING, SOLD, ...) is passed through as-is.
    const status = String(query.status || "").toUpperCase();
    if (!status || ["APPROVED", "AVAILABLE", "LIVE"].includes(status)) {
      where.isApproved = true;
      where.status = { in: ["AVAILABLE", "APPROVED"] };
    } else if (status !== "ALL") {
      where.status = status;
    }

    if (query.brand) where.brand = { equals: query.brand, mode: "insensitive" };
    if (query.fuelType) where.fuelType = query.fuelType;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.category) {
      where.category = { name: { equals: query.category, mode: "insensitive" } };
    }
    if (query.isFeatured !== undefined)
      where.isFeatured =
        query.isFeatured === true || query.isFeatured === "true";

    const [rows, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { category: { select: { id: true, name: true } } },
      }),
      prisma.vehicle.count({ where }),
    ]);

    // Flatten category relation to its name so the UI can filter/display it
    const vehicles = rows.map(({ category, ...v }) => ({
      ...v,
      category: category?.name || v.vehicleType || null,
    }));

    // `vehicles` is what SearchPage reads; `items` kept for older callers
    return { vehicles, items: vehicles, total, page, limit };
  }

  async getHomepageVehicles() {
    const where = {
      isApproved: true,
      status: "AVAILABLE",
    };
    const rows = await prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { category: { select: { id: true, name: true } } },
    });
    // Flatten category relation to its name (UI groups/displays by name)
    const vehicles = rows.map(({ category, ...v }) => ({
      ...v,
      category: category?.name || v.vehicleType || null,
    }));

    const byCategory = vehicles.reduce((groups, vehicle) => {
      const category = vehicle.category || "Other";
      if (!groups[category]) groups[category] = [];
      groups[category].push(vehicle);
      return groups;
    }, {});

    return {
      categories: Object.keys(byCategory),
      byCategory,
      electric: vehicles.filter((vehicle) => vehicle.fuelType === "Electric"),
      latest: vehicles.slice(0, 8),
    };
  }

  async getVehicleById(id) {
    return prisma.vehicle.findUnique({ where: { id } });
  }

  async updateVehicle(id, payload) {
    return prisma.vehicle.update({ where: { id }, data: payload });
  }

  async deleteVehicle(id) {
    return prisma.vehicle.delete({ where: { id } });
  }
}

// ✅ Export as default for ES modules
export default new VehicleService();