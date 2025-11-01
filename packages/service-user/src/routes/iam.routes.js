import express from "express";
import {
  validateCommon,
  validatePermission,
  validatePolicy,
  validateRole,
  sanitizeData,
} from "@shared/middleware/validationMiddleware.js";
import { IAMController } from "../controller/iam.controller.js"; // Fixed import path

const router = express.Router();

// Permission Routes
router.post(
  "/permissions",
  validatePermission.create,
  sanitizeData(["module", "action", "description", "is_active"]),
  IAMController.createPermission
);

router.get("/permissions", validateCommon.query, IAMController.getPermissions);

router.get(
  "/permissions/:permission_id",
  validatePermission.id,
  IAMController.getPermissionById
);

router.put(
  "/permissions/:permission_id",
  validatePermission.id,
  validatePermission.update,
  sanitizeData(["module", "action", "description", "is_active"]),
  IAMController.updatePermission
);

router.delete(
  "/permissions/:permission_id",
  validatePermission.id,
  IAMController.deletePermission
);

// Policy Routes
router.post(
  "/policies",
  validatePolicy.create,
  sanitizeData(["name", "description", "permission_ids", "is_active"]),
  IAMController.createPolicy
);

router.get("/policies", validateCommon.query, IAMController.getPolicies);

router.get(
  "/policies/:policy_id",
  validatePolicy.id,
  IAMController.getPolicyById
);

router.put(
  "/policies/:policy_id",
  validatePolicy.id,
  validatePolicy.update,
  sanitizeData(["name", "description", "permission_ids", "is_active"]),
  IAMController.updatePolicy
);

router.delete(
  "/policies/:policy_id",
  validatePolicy.id,
  IAMController.deletePolicy
);

// Role Routes
router.post(
  "/roles",
  validateRole.create,
  sanitizeData(["name", "description", "policy_ids", "is_active"]),
  IAMController.createRole
);

router.get("/roles", validateCommon.query, IAMController.getRoles);

router.get("/roles/:role_id", validateRole.id, IAMController.getRoleById);

router.put(
  "/roles/:role_id",
  validateRole.id,
  validateRole.update,
  sanitizeData(["name", "description", "policy_ids", "is_active"]),
  IAMController.updateRole
);

router.delete("/roles/:role_id", validateRole.id, IAMController.deleteRole);

export default router;
