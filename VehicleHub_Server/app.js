import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
dotenv.config();

import SellerRoutes from "./src/routes/sellerRoutes.js";
import { notFound, errorHandler } from "./src/middleware/errorMiddleware.js";
import { authenticateUser } from "./src/middleware/authMiddleware.js";
import routes from "./src/routes/index.js";
import authRoutes from "./src/routes/authRoutes.js";
import OTPRoute from "./src/routes/OTPRoute.js";
import VehicleRoutes from "./src/routes/vehicleRoutes.js";


const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  }),
);
app.use(compression());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


 // Routs
app.use("/api/sellers", SellerRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/otp", OTPRoute);

// Vehicle routes
app.use("/api/vehicles", VehicleRoutes);



const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.get("/health", (req, res) =>
  res.json({ status: "ok", service: "vehiclehub-server" }),
);
app.use("/api", routes);

app.use(authenticateUser);
app.use(notFound);
app.use(errorHandler);

export default app;
