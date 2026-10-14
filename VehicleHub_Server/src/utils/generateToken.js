import jwt from "jsonwebtoken";
import {
  jwtSecret,
  jwtRefreshSecret,
  jwtExpiresIn,
  jwtRefreshExpiresIn,
} from "../config/jwt.js";

export const generateAccessToken = (user) =>
  // Create an access token without an `exp` claim so it does not expire
  // until the server-side session/refresh-token is revoked on logout.
  jwt.sign({ id: user.id, role: user.role }, jwtSecret);
export const generateRefreshToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, jwtRefreshSecret, {
    expiresIn: jwtRefreshExpiresIn,
  });
