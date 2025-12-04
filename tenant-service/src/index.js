import express from "express";
import dotenv from "dotenv";
import tenantRouter from "./routes/tenant.routes.js";
dotenv.config();
const app = express();
app.use(express.json());

app.use("/api/tenants", tenantRouter);

const PORT = process.env.PORT || 4002;
const HOST = process.env.HOST || "localhost";
(async () => {
  try {
    console.log("🧩 Checking database  connection...");
    await prisma.$connect();
    console.log("✅ Database connected successfully!");

    app.listen(PORT, HOST, () => {
      console.log(`👤 User service running at http://${HOST}:${PORT}`);
      console.log(`🏥 Health check: http://${HOST}:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`⏰ Started at: ${new Date().toISOString()}`);
    });
  } catch (error) {
    console.error("❌ Failed t connect to database:", error);
    process.exit(1);
  }
})();
