import { prisma  } from '../config/db.js';
import { sendSuccess  } from '../utils/response.js';

export const createCategory = async (req, res, next) => {
  try {
    const category = await prisma.category.create({ data: req.body });
    sendSuccess(res, 'Category created successfully', category, 201);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await prisma.category.update({ where: { id: req.params.id }, data: req.body });
    sendSuccess(res, 'Category updated successfully', category);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    sendSuccess(res, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { createdAt: 'desc' } });
    sendSuccess(res, 'Categories fetched successfully', categories);
  } catch (error) {
    next(error);
  }
};
