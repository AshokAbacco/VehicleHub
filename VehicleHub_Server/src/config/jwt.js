import dotenv from "dotenv";
dotenv.config();

export const jwtSecret = process.env.JWT_SECRET || "vehiclehub-dev-secret";
export const jwtRefreshSecret =
  process.env.JWT_REFRESH_SECRET || "vehiclehub-refresh-secret";
export const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";
export const jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "30d";
