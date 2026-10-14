import { prisma  } from '../config/db.js';
import { sendSuccess, sendError  } from '../utils/response.js';

export const createBrand = async (req, res, next) => {
  try {
    const brand = await prisma.brand.create({ data: req.body });
    sendSuccess(res, 'Brand created successfully', brand, 201);
  } catch (error) {
    next(error);
  }
};

export const updateBrand = async (req, res, next) => {
  try {
    const brand = await prisma.brand.update({ where: { id: req.params.id }, data: req.body });
    sendSuccess(res, 'Brand updated successfully', brand);
  } catch (error) {
    next(error);
  }
};

export const deleteBrand = async (req, res, next) => {
  try {
    await prisma.brand.delete({ where: { id: req.params.id } });
    sendSuccess(res, 'Brand deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const getBrands = async (req, res, next) => {
  try {
    const brands = await prisma.brand.findMany({ orderBy: { createdAt: 'desc' } });
    sendSuccess(res, 'Brands fetched successfully', brands);
  } catch (error) {
    next(error);
  }
};
