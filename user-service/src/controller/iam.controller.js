import { IAMService } from "../services/iamService.js";

export class IAMController {
  // Permission Controllers
  static async createPermission(req, res) {
    try {
      const permission = await IAMService.createPermission(req.body);
      res.status(201).json({
        success: true,
        data: permission,
        message: "Permission created successfully",
      });
    } catch (error) {
      IAMController.handleError(res, error); // Fixed: Use IAMController instead of this
    }
  }

  static async getPermissions(req, res) {
    try {
      const result = await IAMService.getPermissions(req.query);
      res.json({
        success: true,
        data: result.permissions,
        pagination: result.pagination,
      });
    } catch (error) {
      IAMController.handleError(res, error); // Fixed: Use IAMController instead of this
    }
  }

  static async getPermissionById(req, res) {
    try {
      const permission = await IAMService.getPermissionById(
        req.params.permission_id
      );
      if (!permission) {
        return res.status(404).json({
          success: false,
          error: "Permission not found",
        });
      }
      res.json({ success: true, data: permission });
    } catch (error) {
      IAMController.handleError(res, error); // Fixed: Use IAMController instead of this
    }
  }

  static async updatePermission(req, res) {
    try {
      const permission = await IAMService.updatePermission(
        req.params.permission_id,
        req.body
      );
      res.json({
        success: true,
        data: permission,
        message: "Permission updated successfully",
      });
    } catch (error) {
      IAMController.handleError(res, error); // Fixed: Use IAMController instead of this
    }
  }

  static async deletePermission(req, res) {
    try {
      await IAMService.deletePermission(req.params.permission_id);
      res.json({
        success: true,
        message: "Permission deleted successfully",
      });
    } catch (error) {
      IAMController.handleError(res, error); // Fixed: Use IAMController instead of this
    }
  }

  // Policy Controllers
  static async createPolicy(req, res) {
    try {
      const policy = await IAMService.createPolicy(req.body);
      res.status(201).json({
        success: true,
        data: policy,
        message: "Policy created successfully",
      });
    } catch (error) {
      IAMController.handleError(res, error); // Fixed: Use IAMController instead of this
    }
  }

  static async getPolicies(req, res) {
    try {
      const result = await IAMService.getPolicies(req.query);
      res.json({
        success: true,
        data: result.policies,
        pagination: result.pagination,
      });
    } catch (error) {
      IAMController.handleError(res, error); // Fixed: Use IAMController instead of this
    }
  }

  static async getPolicyById(req, res) {
    try {
      const policy = await IAMService.getPolicyById(req.params.policy_id);
      if (!policy) {
        return res.status(404).json({
          success: false,
          error: "Policy not found",
        });
      }
      res.json({ success: true, data: policy });
    } catch (error) {
      IAMController.handleError(res, error); // Fixed: Use IAMController instead of this
    }
  }

  static async updatePolicy(req, res) {
    try {
      const policy = await IAMService.updatePolicy(
        req.params.policy_id,
        req.body
      );
      res.json({
        success: true,
        data: policy,
        message: "Policy updated successfully",
      });
    } catch (error) {
      IAMController.handleError(res, error); // Fixed: Use IAMController instead of this
    }
  }

  static async deletePolicy(req, res) {
    try {
      await IAMService.deletePolicy(req.params.policy_id);
      res.json({
        success: true,
        message: "Policy deleted successfully",
      });
    } catch (error) {
      IAMController.handleError(res, error); // Fixed: Use IAMController instead of this
    }
  }

  // Role Controllers
  static async createRole(req, res) {
    try {
      const role = await IAMService.createRole(req.body);
      res.status(201).json({
        success: true,
        data: role,
        message: "Role created successfully",
      });
    } catch (error) {
      IAMController.handleError(res, error); // Fixed: Use IAMController instead of this
    }
  }

  static async getRoles(req, res) {
    try {
      const result = await IAMService.getRoles(req.query);
      res.json({
        success: true,
        data: result.roles,
        pagination: result.pagination,
      });
    } catch (error) {
      IAMController.handleError(res, error); // Fixed: Use IAMController instead of this
    }
  }

  static async getRoleById(req, res) {
    try {
      const role = await IAMService.getRoleById(req.params.role_id);
      if (!role) {
        return res.status(404).json({
          success: false,
          error: "Role not found",
        });
      }
      res.json({ success: true, data: role });
    } catch (error) {
      IAMController.handleError(res, error); // Fixed: Use IAMController instead of this
    }
  }

  static async updateRole(req, res) {
    try {
      const role = await IAMService.updateRole(req.params.role_id, req.body);
      res.json({
        success: true,
        data: role,
        message: "Role updated successfully",
      });
    } catch (error) {
      IAMController.handleError(res, error); // Fixed: Use IAMController instead of this
    }
  }

  static async deleteRole(req, res) {
    try {
      await IAMService.deleteRole(req.params.role_id);
      res.json({
        success: true,
        message: "Role deleted successfully",
      });
    } catch (error) {
      IAMController.handleError(res, error); // Fixed: Use IAMController instead of this
    }
  }

  // Generic error handler
  static handleError(res, error) {
    console.error("Controller error:", error);

    // Handle custom service errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: error.message,
      });
    }

    if (error.name === "NotFoundError") {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: error.message,
      });
    }

    if (error.name === "DatabaseError") {
      return res.status(500).json({
        success: false,
        error: "Database Error",
        message: error.message,
      });
    }

    // Prisma errors
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: "Duplicate entry",
        message: "A record with this data already exists",
      });
    }

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        error: "Record not found",
        message: "The requested resource was not found",
      });
    }

    // Default error
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
}
