import express from "express";
import authRoute from "./auth.route.js";
import IAM from "./iam.routes.js";

const router = express.Router();

// Mount the route modules
router.use("/auth", authRoute);
router.use("/iam", IAM);

export default router;
