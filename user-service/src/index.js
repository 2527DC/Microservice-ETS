import express from "express";
import dotenv from "dotenv";
// import { PrismaClient } from "@prisma/client";
import rootRoute from "./routes/index.route.js";
import { prisma } from "@shared/db";
dotenv.config();
const app = express();
// const prisma = new PrismaClient();

app.use(
  express.json({
    limit: "10mb",
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`; // Lightweight query to verify DB connection
    res.status(200).json({
      success: true,
      message: "User service is healthy and connected to DB!",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "User service running but database connection failed",
      error: error.message,
    });
  }
});

app.use("/api", rootRoute);

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
    message: "Please check the API documentation",
  });
});

// Graceful shutdowns
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing Prisma connection...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, closing Prisma connection...");
  await prisma.$disconnect();
  process.exit(0);
});

// Handle unhandled errors
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

// ✅ Check DB connection before starting server
const PORT = process.env.PORT || 4001;
const HOST = process.env.HOST || "localhost";

(async () => {
  try {
    console.log("🧩 Checking database connection...");
    await prisma.$connect();
    console.log("✅ Database connected successfully!");

    app.listen(PORT, HOST, () => {
      console.log(`👤 User service running at http://${HOST}:${PORT}`);
      console.log(`🏥 Health check: http://${HOST}:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`⏰ Started at: ${new Date().toISOString()}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
    process.exit(1);
  }
})();

export default app;
