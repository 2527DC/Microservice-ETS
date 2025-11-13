import express from "express";
import TenantController from "../controller/tenant.controller.js";

const router = express.Router();

router.post("/", TenantController.createTenant);
router.get("/", TenantController.getTenants);
router.get("/:id", TenantController.getTenantById);
router.put("/:id", TenantController.updateTenant);
router.delete("/:id", TenantController.deleteTenant);

export default router;
