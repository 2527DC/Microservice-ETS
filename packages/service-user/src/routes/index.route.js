import express from "express";
import authRoute from "./auth.route.js";
import IAM from "./iam.routes.js";

const router = express.Router();

router.get("/auth", authRoute);
router.get("/iam", IAM);
export default router;
