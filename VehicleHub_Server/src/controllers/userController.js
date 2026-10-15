// VehicleHub/VehicleHub_Server/src/controllers/userController.js
import { normalizePhone } from '../utils/phone.js';
import { prisma } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

// Never send password hashes to the client
const safeUser = {
  id: true, email: true, username: true, role: true, fullName: true, lastName: true, phone: true,
  avatar: true, isVerified: true, isActive: true, isBlocked: true, createdAt: true, updatedAt: true,
};
const ROLES = ['ADMIN', 'SELLER', 'DEALER', 'BUYER', 'INSPECTOR'];

// GET /api/users  (admin)  ?role=INSPECTOR&search=
export const getAllUsers = async (req, res, next) => {
  try {
    const role = String(req.query.role || '').toUpperCase();
    const search = String(req.query.search || '').trim();
    const users = await prisma.user.findMany({
      where: {
        ...(ROLES.includes(role) ? { role } : {}),
        ...(search ? { OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
        ] } : {}),
      },
      orderBy: { createdAt: 'desc' },
      select: safeUser,
    });
    sendSuccess(res, 'Users fetched successfully', users);
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id  (admin, or the user themself)
export const getUserById = async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.id !== req.params.id) {
      return sendError(res, 'Access denied', 403);
    }
    const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: safeUser });
    if (!user) return sendError(res, 'User not found', 404);
    sendSuccess(res, 'User fetched successfully', user);
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/:id  (admin) — whitelisted fields only
export const updateUser = async (req, res, next) => {
  try {
    const b = req.body || {};
    const data = {};
    ['fullName', 'lastName', 'phone', 'avatar'].forEach((k) => { if (b[k] !== undefined) data[k] = b[k]; });
    if (data.phone !== undefined) data.phone = normalizePhone(data.phone) || null;
    ['isActive', 'isBlocked', 'isVerified'].forEach((k) => { if (b[k] !== undefined) data[k] = b[k] === true || b[k] === 'true'; });
    if (b.role !== undefined) {
      const role = String(b.role).toUpperCase();
      if (!ROLES.includes(role)) return sendError(res, 'Role must be ADMIN, SELLER, DEALER, BUYER or INSPECTOR', 400);
      if (req.params.id === req.user.id && role !== 'ADMIN') return sendError(res, "You can't remove your own admin role", 400);
      data.role = role;
    }
    const user = await prisma.user.update({ where: { id: req.params.id }, data, select: safeUser });
    sendSuccess(res, 'User updated successfully', user);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/:id  (admin) — deactivates; rows with orders/payments are kept
export const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) return sendError(res, "You can't delete your own account", 400);
    await prisma.user.update({ where: { id: req.params.id }, data: { isActive: false } });
    sendSuccess(res, 'User deactivated successfully');
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/profile  (any logged-in user) — own name / phone / avatar only
export const updateProfile = async (req, res, next) => {
  try {
    const b = req.body || {};
    const data = {};
    ['fullName', 'lastName', 'phone', 'avatar'].forEach((k) => { if (b[k] !== undefined) data[k] = b[k]; });
    if (data.phone !== undefined) data.phone = normalizePhone(data.phone) || null;
    const user = await prisma.user.update({ where: { id: req.user.id }, data, select: safeUser });
    sendSuccess(res, 'Profile updated successfully', user);
  } catch (error) {
    next(error);
  }
};

export const uploadProfilePicture = async (req, res) => sendSuccess(res, 'Profile picture upload ready');

const setFlag = (data, message) => async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) return sendError(res, "You can't change your own account status", 400);
    const user = await prisma.user.update({ where: { id: req.params.id }, data, select: safeUser });
    sendSuccess(res, message, user);
  } catch (error) {
    next(error);
  }
};
export const blockUser = setFlag({ isBlocked: true }, 'User blocked');
export const activateUser = setFlag({ isBlocked: false, isActive: true }, 'User activated');