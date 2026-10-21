// VehicleHub/VehicleHub_Server/server.js
import app from "./app.js";
import { prisma } from "./src/config/db.js";
import { missingStorageSettings } from "./src/utils/storeUpload.js";
import { startInvoiceRetryLoop } from "./src/services/invoiceEmail.js";

const PORT = process.env.PORT || 5001;

async function main() {
  // The live server must use a hosted database, not the one on your own computer
  const dbUrl = String(process.env.DATABASE_URL || "");
  if (!dbUrl) {
    console.error("DATABASE_URL is not set. Add it to the server's environment variables.");
  } else if (/@(localhost|127\.0\.0\.1)[:/]/.test(dbUrl) && process.env.NODE_ENV === "production") {
    console.error("DATABASE_URL points to localhost — on a hosted server that is the server itself, not your PC. Use your hosted database's connection URL.");
  }

  try {
    await prisma.$connect();
    console.log("Database connected");
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }

  // Uploads go to Cloudflare R2 only — warn early if it isn't set up
  const missing = missingStorageSettings();
  if (missing.length) console.warn(`File uploads are disabled until these are set in .env: ${missing.join(", ")}`);
  else console.log(`File uploads -> Cloudflare R2 bucket "${process.env.CF_BUCKET_NAME}"`);

  app.listen(PORT, () => {
    console.log(`VehicleHub server running on port ${PORT}`);
  });

  // Plan invoices that failed to email are retried in the background
  startInvoiceRetryLoop();
}

main();