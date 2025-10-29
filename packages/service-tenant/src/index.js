import express from "express";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

app.listen(4002, () =>
  console.log("📘 Tenant  service running at http://localhost:4002")
);
