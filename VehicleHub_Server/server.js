import app from "./app.js";
import { prisma } from "./src/config/db.js";

const PORT = process.env.PORT || 5001;

async function main() {
  try {
    await prisma.$connect();
    console.log("Database connected");
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }

  app.listen(PORT, () => {
    console.log(`VehicleHub server running on port ${PORT}`);
  });
}

main();
