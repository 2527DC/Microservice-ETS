import express from "express";
import dotenv from "dotenv";
import tenantRouter from "./routes/tenant.routes.js";
dotenv.config();
const app = express();
app.use(express.json());

app.use("/api/tenants", tenantRouter);
app.listen(4002, () =>
  console.log("📘 Tenant  service running at http://localhost:4002")
);
