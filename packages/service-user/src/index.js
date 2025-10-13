import express from "express";
import dotenv from "dotenv";
import router from "./routes/user.route.js";

dotenv.config();
const app = express();
app.use(express.json());

app.use(router);

app.listen(4001, () =>
  console.log("👤 User service running at http://localhost:4001")
);
