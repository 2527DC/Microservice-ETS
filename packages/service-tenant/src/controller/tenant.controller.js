// import TenantService from "../services/tenantService.js";
import TenantService from "../service/tenant.service.js";
import { handleControllerError } from "../utils/errors.js";
// import { handleControllerError } from "../utils/controllerErrorHandler.js";

export default class TenantController {
  // ➕ Create Tenant
  static async createTenant(req, res) {
    try {
      const result = await TenantService.createTenant(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      handleControllerError(res, error);
    }
  }

  // 📄 Get All Tenants
  static async getTenants(req, res) {
    try {
      const result = await TenantService.getTenants(req.query);
      res.json({
        success: true,
        data: result.tenants,
        pagination: result.pagination,
      });
    } catch (error) {
      handleControllerError(res, error);
    }
  }

  // 🔍 Get Tenant by ID
  static async getTenantById(req, res) {
    try {
      const { id } = req.params;
      const tenant = await TenantService.getTenantById(id);
      res.json({ success: true, data: tenant });
    } catch (error) {
      handleControllerError(res, error);
    }
  }

  // ✏️ Update Tenant
  static async updateTenant(req, res) {
    try {
      const { id } = req.params;
      const updated = await TenantService.updateTenant(id, req.body);
      res.json({ success: true, data: updated });
    } catch (error) {
      handleControllerError(res, error);
    }
  }

  // ❌ Delete Tenant
  static async deleteTenant(req, res) {
    try {
      const { id } = req.params;
      await TenantService.deleteTenant(id);
      res.json({ success: true, message: "Tenant deleted successfully" });
    } catch (error) {
      handleControllerError(res, error);
    }
  }
}
