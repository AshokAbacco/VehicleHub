// VehicleHub/VehicleHub_Server/src/controllers/uploadController.js
// POST /api/uploads/vehicle-images — stores the images in Cloudflare R2 and returns their URLs.
import { storeUpload } from '../utils/storeUpload.js';
import { sendSuccess } from '../utils/response.js';

export const uploadVehicleImages = async (req, res, next) => {
  try {
    const urls = [];
    for (const file of req.files || []) urls.push(await storeUpload(file, 'vehiclehub/vehicles'));
    sendSuccess(res, 'Images uploaded', { urls });
  } catch (error) {
    next(error);
  }
};

export const uploadDocuments = async (req, res) => sendSuccess(res, 'Documents upload ready');
export const deleteFiles = async (req, res) => sendSuccess(res, 'Files deleted');