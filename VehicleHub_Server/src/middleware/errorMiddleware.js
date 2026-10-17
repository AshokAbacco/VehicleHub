// VehicleHub/VehicleHub_Server/src/middleware/errorMiddleware.js
export const notFound = (req, res, next) => {
  res.status(404).json({ success: false, message: "Route not found" });
};

// Prisma errors that mean "the database can't be reached" (wrong DATABASE_URL, database down / asleep)
const DB_UNREACHABLE = new Set(["P1000", "P1001", "P1002", "P1003", "P1008", "P1017"]);
const isDbUnreachable = (err) =>
  err?.name === "PrismaClientInitializationError" ||
  DB_UNREACHABLE.has(err?.errorCode) ||
  DB_UNREACHABLE.has(err?.code) ||
  /can't reach database server|connection refused|connect (ECONNREFUSED|ENOENT|ETIMEDOUT)|database server .* is not running/i.test(String(err?.message || "")) ||
  (String(err?.name || "").startsWith("PrismaClient") && ["ECONNREFUSED", "ENOENT", "ETIMEDOUT"].includes(err?.meta?.cause?.code || err?.cause?.code));

export const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Never show database / internal error text to users — it's logged above for you instead
  if (isDbUnreachable(err)) {
    return res.status(503).json({
      success: false,
      message: "The service is temporarily unavailable. Please try again in a minute.",
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  const isDev = process.env.NODE_ENV === "development";
  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 && !isDev ? "Something went wrong. Please try again." : err.message || "Something went wrong",
    stack: isDev ? err.stack : undefined,
  });
};