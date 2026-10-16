// VehicleHub/VehicleHub_Server/src/validations/authValidation.js
import Joi from "joi";

// POST /api/auth/register — public sign-up always creates a BUYER account
export const registerSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(80).required().messages({
    "string.empty": "Full name is required",
    "string.min": "Full name is too short",
    "any.required": "Full name is required",
  }),
  email: Joi.string().trim().email().required().messages({
    "string.email": "Enter a valid email address",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),
  // spaces / dashes are fine: "98765 43210", "+91-98765-43210"
  phone: Joi.string().trim().custom((value, helpers) =>
    /^(91)?[6-9]\d{9}$/.test(value.replace(/\D/g, "")) ? value : helpers.error("string.pattern.base")
  ).required().messages({
    "string.pattern.base": "Enter a valid 10-digit mobile number",
    "string.empty": "Mobile number is required",
    "any.required": "Mobile number is required",
  }),
  password: Joi.string().min(8).max(72).required().messages({
    "string.min": "Password must be at least 8 characters",
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),
});

// POST /api/auth/login — email or mobile number + password
export const loginSchema = Joi.object({
  identifier: Joi.string().trim().required().messages({
    "string.empty": "Enter your email or mobile number",
    "any.required": "Enter your email or mobile number",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Enter your password",
    "any.required": "Enter your password",
  }),
});