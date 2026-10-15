// VehicleHub/VehicleHub_Server/server.js
import app from "./app.js";
import { prisma } from "./src/config/db.js";
import { missingStorageSettings } from "./src/utils/storeUpload.js";

const PORT = process.env.PORT || 5001;

async function main() {
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
}

main();