import { prisma  } from '../config/db.js';
import { sendSuccess, sendError  } from '../utils/response.js';
import { validate  } from '../middleware/validationMiddleware.js';
import { updateUserSchema  } from '../validations/userValidation.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    sendSuccess(res, 'Users fetched successfully', users);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return sendError(res, 'User not found', 404);
    sendSuccess(res, 'User fetched successfully', user);
  } catch (error) {
    next(error);
  }
};

export const updateUser = [
  validate(updateUserSchema),
  async (req, res, next) => {
    try {
      const user = await prisma.user.update({ where: { id: req.params.id }, data: req.body });
      sendSuccess(res, 'User updated successfully', user);
    } catch (error) {
      next(error);
    }
  },
];

export const deleteUser = async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    sendSuccess(res, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.update({ where: { id: req.user.id }, data: req.body });
    sendSuccess(res, 'Profile updated successfully', user);
  } catch (error) {
    next(error);
  }
};

export const uploadProfilePicture = async (req, res) => sendSuccess(res, 'Profile picture upload ready');
export const blockUser = async (req, res) => sendSuccess(res, 'User blocked');
export const activateUser = async (req, res) => sendSuccess(res, 'User activated');
