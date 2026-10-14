import wishlistModel from '../models/wishlistModel.js';
import { sendSuccess  } from '../utils/response.js';

export const addWishlist = async (req, res, next) => {
  try {
    const wishlist = await wishlistModel.add({ userId: req.user.id, vehicleId: req.params.vehicleId });
    sendSuccess(res, 'Vehicle added to wishlist', wishlist, 201);
  } catch (error) {
    next(error);
  }
};

export const removeWishlist = async (req, res, next) => {
  try {
    await wishlistModel.remove(req.user.id, req.params.vehicleId);
    sendSuccess(res, 'Vehicle removed from wishlist');
  } catch (error) {
    next(error);
  }
};

export const getWishlist = async (req, res, next) => {
  try {
    const items = await wishlistModel.findByUser(req.user.id);
    sendSuccess(res, 'Wishlist fetched successfully', items);
  } catch (error) {
    next(error);
  }
};
