import { prisma } from "@shared/db";
import { DatabaseError, ValidationError } from "../utils/errors.js";

export default class TenantService {
  // 🔹 Create Tenant
  static async createTenant(data) {
    try {
      // Check if tenant with same name exists
      const existingTenant = await prisma.tenant.findUnique({
        where: { name: data.name },
      });

      if (existingTenant) {
        throw new ValidationError("Tenant with this name already exists");
      }

      return await prisma.tenant.create({ data });
    } catch (error) {
      throw new DatabaseError("Failed to create tenant", error);
    }
  }

  // 🔹 Get All Tenants (with optional search/filter)
  static async getTenants(filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        is_active,
        search,
        sort_by = "created_at",
        sort_order = "desc",
        ...where
      } = filters;

      const skip = (page - 1) * limit;

      const searchCondition = search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { address: { contains: search, mode: "insensitive" } },
            ],
          }
        : {};

      const whereCondition = {
        ...where,
        ...searchCondition,
        ...(is_active !== undefined && { is_active: is_active === "true" }),
      };

      const [tenants, total] = await Promise.all([
        prisma.tenant.findMany({
          where: whereCondition,
          skip,
          take: parseInt(limit),
          orderBy: { [sort_by]: sort_order },
        }),
        prisma.tenant.count({ where: whereCondition }),
      ]);

      return {
        tenants,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new DatabaseError("Failed to fetch tenants", error);
    }
  }

  // 🔹 Get Single Tenant by ID
  static async getTenantById(tenant_id) {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { tenant_id },
      });

      if (!tenant) throw new ValidationError("Tenant not found");
      return tenant;
    } catch (error) {
      throw new DatabaseError("Failed to fetch tenant", error);
    }
  }

  // 🔹 Update Tenant
  static async updateTenant(tenant_id, data) {
    try {
      const existingTenant = await prisma.tenant.findUnique({
        where: { tenant_id },
      });
      if (!existingTenant) throw new ValidationError("Tenant not found");

      return await prisma.tenant.update({
        where: { tenant_id },
        data,
      });
    } catch (error) {
      throw new DatabaseError("Failed to update tenant", error);
    }
  }

  // 🔹 Delete Tenant
  static async deleteTenant(tenant_id) {
    try {
      const existingTenant = await prisma.tenant.findUnique({
        where: { tenant_id },
      });
      if (!existingTenant) throw new ValidationError("Tenant not found");

      return await prisma.tenant.delete({ where: { tenant_id } });
    } catch (error) {
      throw new DatabaseError("Failed to delete tenant", error);
    }
  }
}
