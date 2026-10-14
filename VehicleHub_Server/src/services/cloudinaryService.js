import cloudinary from "../config/cloudinary.js";

class CloudinaryService {
  async uploadBuffer(buffer, folder = "vehiclehub") {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      stream.end(buffer);
    });
  }
}

export default new CloudinaryService();
