import express from "express";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

app.listen(4001, () =>
  console.log("👤 User service running at http://localhost:4001")
);
nv;
