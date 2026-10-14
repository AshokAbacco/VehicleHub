import cloudinaryService from '../services/cloudinaryService.js';
import { sendSuccess  } from '../utils/response.js';

export const uploadVehicleImages = async (req, res, next) => {
  try {
    const files = req.files || [];
    const urls = [];
    for (const file of files) {
      const result = await cloudinaryService.uploadBuffer(file.buffer, 'vehiclehub/vehicles');
      urls.push(result.secure_url);
    }
    sendSuccess(res, 'Images uploaded', { urls });
  } catch (error) {
    next(error);
  }
};

export const uploadDocuments = async (req, res) => sendSuccess(res, 'Documents upload ready');
export const deleteFiles = async (req, res) => sendSuccess(res, 'Files deleted');
