const Joi = require('joi');

const createVehicleSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().optional(),
  price: Joi.number().optional(),
  brand: Joi.string().required(),
  model: Joi.string().required(),
  variant: Joi.string().optional(),
  year: Joi.number().optional(),
  mileage: Joi.number().optional(),
  fuelType: Joi.string().required(),
  transmission: Joi.string().required(),
  color: Joi.string().optional(),
  registrationNumber: Joi.string().optional(),
  location: Joi.string().optional(),
  images: Joi.array().items(Joi.string()).optional(),
  documents: Joi.array().items(Joi.string()).optional(),
  features: Joi.array().items(Joi.string()).optional(),
  sellerId: Joi.string().optional(),
  categoryId: Joi.string().optional(),
  brandId: Joi.string().optional(),
  status: Joi.string().optional(),
});

module.exports = { createVehicleSchema };
