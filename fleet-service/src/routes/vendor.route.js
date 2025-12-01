import express from "express";
import { getVendorsController } from "../controllers/vendor.controller.js";
const router = express.Router();

router.get("/", getVendorsController);

export default router;
