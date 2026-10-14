// import jwt from "jsonwebtoken";
// import { prisma } from "../config/db.js";
// import { jwtSecret } from "../config/jwt.js";

// const authenticateUser = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization || "";
//     const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

//     if (!token) {
//       req.user = null;
//       return next();
//     }

//     const decoded = jwt.verify(token, jwtSecret);
//     const user = await prisma.user.findUnique({ where: { id: decoded.id } });

//     if (!user || user.isBlocked) {
//       req.user = null;
//       return next();
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     req.user = null;
//     next();
//   }
// };

// // Blocks the request entirely if not authenticated — use this on routes that REQUIRE login
// // (authenticateUser alone just attaches req.user OR null and always calls next())
// const requireAuth = (req, res, next) => {
//   if (!req.user) {
//     return res
//       .status(401)
//       .json({ success: false, message: "Authentication required" });
//   }
//   next();
// };

// const authorizeRoles = (...roles) => {
//   return (req, res, next) => {
//     if (!req.user) {
//       return res
//         .status(401)
//         .json({ success: false, message: "Authentication required" });
//     }
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({ success: false, message: "Access denied" });
//     }
//     next();
//   };
// };

// export { authenticateUser, requireAuth, authorizeRoles };

import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";
import { jwtSecret } from "../config/jwt.js";

// ======================================================
// AUTHENTICATE USER
// ======================================================
// Optional authentication middleware.
//
// If token exists:
//   -> verify JWT
//   -> find user
//   -> attach user to req.user
//
// If token does not exist:
//   -> req.user = null
//   -> continue request
//
// Use this when a route can work for both guests and users.
// ======================================================

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    // No token = guest user
    if (!token) {
      req.user = null;
      return next();
    }

    // Verify JWT
    const decoded = jwt.verify(token, jwtSecret);

    // Find user from database
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    // User doesn't exist or is blocked
    if (!user || user.isBlocked || !user.isActive) {
      req.user = null;
      return next();
    }

    // Attach authenticated user
    req.user = user;

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    // Invalid/expired token behaves as unauthenticated
    req.user = null;

    next();
  }
};

// ======================================================
// REQUIRE AUTHENTICATION
// ======================================================
// Use this AFTER authenticateUser on routes that require
// the user to be logged in.
//
// Example:
//
// router.post(
//     "/vehicles",
//     authenticateUser,
//     requireAuth,
//     createVehicle
// );
//
// ======================================================

const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  next();
};

// ======================================================
// ROLE AUTHORIZATION
// ======================================================
// Allows only specific roles.
//
// Example:
//
// authorizeRoles("SELLER")
//
// or:
//
// authorizeRoles("SELLER", "DEALER")
//
// ======================================================

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // User must be logged in
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Check role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
};

export { authenticateUser, requireAuth, authorizeRoles };
