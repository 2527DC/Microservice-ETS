import { prisma } from "@shared/db";

import {
  NotFoundError,
  ValidationError,
  DatabaseError,
} from "../utils/errors.js";

export class IAMService {
  // Permission Services
  static async createPermission(data) {
    try {
      // ✅ Check if permission already exists using the compound unique constraint
      const existingPermission = await prisma.permission.findUnique({
        where: {
          uq_permission_module_action: {
            module: data.module,
            action: data.action,
          },
        },
      });

      if (existingPermission) {
        throw new ValidationError(
          "Permission with this module and action already exists"
        );
      }

      // ✅ Create new permission
      return await prisma.permission.create({
        data: {
          module: data.module,
          action: data.action,
          description: data.description,
          is_active: data.is_active !== undefined ? data.is_active : true,
        },
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError("Failed to create permission", error);
    }
  }

  static async getPermissions(filters = {}) {
    try {
      const {
        page,
        limit,
        is_active,
        search,
        sort_by = "created_at",
        sort_order = "desc",
        ...where
      } = filters;

      // ✅ Determine if pagination is active
      const usePagination =
        page &&
        limit &&
        !isNaN(page) &&
        !isNaN(limit) &&
        page !== "undefined" &&
        limit !== "undefined";

      // ✅ Build search condition
      const searchCondition = search
        ? {
            OR: [
              { module: { contains: search, mode: "insensitive" } },
              { action: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {};

      // ✅ Build where clause safely
      const whereCondition = {
        ...searchCondition,
        ...(is_active === "true" ? { is_active: true } : {}),
        ...(is_active === "false" ? { is_active: false } : {}),
      };

      // ✅ Fetch data (with or without pagination)
      const permissions = await prisma.permission.findMany({
        where: whereCondition,
        include: {
          _count: { select: { policy_permissions: true } },
        },
        ...(usePagination && {
          skip: (parseInt(page) - 1) * parseInt(limit),
          take: parseInt(limit),
        }),
        orderBy: { [sort_by]: sort_order },
      });

      const total = usePagination
        ? await prisma.permission.count({ where: whereCondition })
        : permissions.length;

      return {
        permissions,
        pagination: usePagination
          ? {
              page: parseInt(page),
              limit: parseInt(limit),
              total,
              pages: Math.ceil(total / limit),
            }
          : null,
      };
    } catch (error) {
      console.error("❌ Error in getPermissions:", error);
      throw new DatabaseError("Failed to fetch permissions", error);
    }
  }

  static async getPermissionById(permission_id) {
    try {
      const permission = await prisma.permission.findUnique({
        where: { permission_id: parseInt(permission_id) },
        include: {
          policy_permissions: {
            include: {
              policy: {
                include: {
                  _count: {
                    select: {
                      role_policies: true,
                    },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              policy_permissions: true,
            },
          },
        },
      });

      if (!permission) {
        throw new NotFoundError("Permission not found");
      }

      return permission;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError("Failed to fetch permission", error);
    }
  }

  static async updatePermission(permission_id, data) {
    try {
      // Check if permission exists
      const existingPermission = await prisma.permission.findUnique({
        where: { permission_id: parseInt(permission_id) },
      });

      if (!existingPermission) {
        throw new NotFoundError("Permission not found");
      }

      // Check for duplicate module-action combination if updating module or action
      if (data.module || data.action) {
        const duplicatePermission = await prisma.permission.findFirst({
          where: {
            module: data.module || existingPermission.module,
            action: data.action || existingPermission.action,
            NOT: { permission_id: parseInt(permission_id) },
          },
        });

        if (duplicatePermission) {
          throw new ValidationError(
            "Permission with this module and action already exists"
          );
        }
      }

      return await prisma.permission.update({
        where: { permission_id: parseInt(permission_id) },
        data: {
          ...data,
          updated_at: new Date(),
        },
      });
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError("Failed to update permission", error);
    }
  }

  static async deletePermission(permission_id) {
    try {
      // Check if permission exists
      const existingPermission = await prisma.permission.findUnique({
        where: { permission_id: parseInt(permission_id) },
        include: {
          policy_permissions: true,
        },
      });

      if (!existingPermission) {
        throw new NotFoundError("Permission not found");
      }

      // Check if permission is being used in any policies
      if (existingPermission.policy_permissions.length > 0) {
        throw new ValidationError(
          "Cannot delete permission as it is assigned to one or more policies"
        );
      }

      return await prisma.permission.delete({
        where: { permission_id: parseInt(permission_id) },
      });
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError("Failed to delete permission", error);
    }
  }

  // Policy Services
  static async createPolicy(data) {
    try {
      const { permission_ids, ...policyData } = data;

      // Check if policy name already exists for this tenant
      const existingPolicy = await prisma.policy.findFirst({
        where: {
          name: policyData.name,
          tenant_id: policyData.tenant_id || null,
        },
      });

      if (existingPolicy) {
        throw new ValidationError(
          "Policy with this name already exists for the tenant"
        );
      }

      // Validate permissions exist if provided
      if (permission_ids && permission_ids.length > 0) {
        const permissions = await prisma.permission.findMany({
          where: {
            permission_id: { in: permission_ids.map((id) => parseInt(id)) },
            is_active: true,
          },
        });

        if (permissions.length !== permission_ids.length) {
          throw new ValidationError(
            "One or more permissions are invalid or inactive"
          );
        }
      }

      return await prisma.policy.create({
        data: {
          ...policyData,
          ...(permission_ids &&
            permission_ids.length > 0 && {
              policy_permissions: {
                create: permission_ids.map((permission_id) => ({
                  permission_id: parseInt(permission_id),
                })),
              },
            }),
        },
        include: {
          policy_permissions: {
            include: {
              permission: true,
            },
          },
          tenant: true,
          _count: {
            select: {
              role_policies: true,
              policy_permissions: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError("Failed to create policy", error);
    }
  }

  static async getPolicies(filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        tenant_id,
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
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {};

      const [policies, total] = await Promise.all([
        prisma.policy.findMany({
          where: {
            ...where,
            ...searchCondition,
            ...(tenant_id && { tenant_id: parseInt(tenant_id) }),
            ...(is_active !== undefined && { is_active: is_active === "true" }),
          },
          include: {
            policy_permissions: {
              include: {
                permission: true,
              },
            },
            tenant: true,
            _count: {
              select: {
                role_policies: true,
                policy_permissions: true,
              },
            },
          },
          skip,
          take: parseInt(limit),
          orderBy: { [sort_by]: sort_order },
        }),
        prisma.policy.count({
          where: {
            ...where,
            ...searchCondition,
            ...(tenant_id && { tenant_id: parseInt(tenant_id) }),
            ...(is_active !== undefined && { is_active: is_active === "true" }),
          },
        }),
      ]);

      return {
        policies,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new DatabaseError("Failed to fetch policies", error);
    }
  }

  static async getPolicyById(policy_id) {
    try {
      const policy = await prisma.policy.findUnique({
        where: { policy_id: parseInt(policy_id) },
        include: {
          policy_permissions: {
            include: {
              permission: true,
            },
          },
          role_policies: {
            include: {
              role: true,
            },
          },
          tenant: true,
          _count: {
            select: {
              role_policies: true,
              policy_permissions: true,
            },
          },
        },
      });

      if (!policy) {
        throw new NotFoundError("Policy not found");
      }

      return policy;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError("Failed to fetch policy", error);
    }
  }

  static async updatePolicy(policy_id, data) {
    try {
      const { permission_ids, ...policyData } = data;

      // Check if policy exists
      const existingPolicy = await prisma.policy.findUnique({
        where: { policy_id: parseInt(policy_id) },
      });

      if (!existingPolicy) {
        throw new NotFoundError("Policy not found");
      }

      // Check for duplicate name if updating name
      if (policyData.name) {
        const duplicatePolicy = await prisma.policy.findFirst({
          where: {
            name: policyData.name,
            tenant_id: policyData.tenant_id || existingPolicy.tenant_id,
            NOT: { policy_id: parseInt(policy_id) },
          },
        });

        if (duplicatePolicy) {
          throw new ValidationError(
            "Policy with this name already exists for the tenant"
          );
        }
      }

      return await prisma.$transaction(async (tx) => {
        // Update policy permissions if provided
        if (permission_ids !== undefined) {
          // Remove existing permissions
          await tx.policyPermission.deleteMany({
            where: { policy_id: parseInt(policy_id) },
          });

          // Add new permissions if provided
          if (permission_ids.length > 0) {
            // Validate permissions exist
            const permissions = await tx.permission.findMany({
              where: {
                permission_id: { in: permission_ids.map((id) => parseInt(id)) },
                is_active: true,
              },
            });

            if (permissions.length !== permission_ids.length) {
              throw new ValidationError(
                "One or more permissions are invalid or inactive"
              );
            }

            await tx.policyPermission.createMany({
              data: permission_ids.map((permission_id) => ({
                policy_id: parseInt(policy_id),
                permission_id: parseInt(permission_id),
              })),
            });
          }
        }

        // Update policy data
        return await tx.policy.update({
          where: { policy_id: parseInt(policy_id) },
          data: {
            ...policyData,
            updated_at: new Date(),
          },
          include: {
            policy_permissions: {
              include: {
                permission: true,
              },
            },
            _count: {
              select: {
                role_policies: true,
                policy_permissions: true,
              },
            },
          },
        });
      });
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError("Failed to update policy", error);
    }
  }

  static async deletePolicy(policy_id) {
    try {
      // Check if policy exists
      const existingPolicy = await prisma.policy.findUnique({
        where: { policy_id: parseInt(policy_id) },
        include: {
          role_policies: true,
        },
      });

      if (!existingPolicy) {
        throw new NotFoundError("Policy not found");
      }

      // Check if policy is being used in any roles
      if (existingPolicy.role_policies.length > 0) {
        throw new ValidationError(
          "Cannot delete policy as it is assigned to one or more roles"
        );
      }

      // Check if it's a system policy
      if (existingPolicy.is_system_policy) {
        throw new ValidationError("Cannot delete system policy");
      }

      return await prisma.policy.delete({
        where: { policy_id: parseInt(policy_id) },
      });
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError("Failed to delete policy", error);
    }
  }

  // Role Services
  static async createRole(data) {
    try {
      const { policy_ids, ...roleData } = data;

      // Check if role name already exists for this tenant
      const existingRole = await prisma.role.findFirst({
        where: {
          name: roleData.name,
          tenant_id: roleData.tenant_id || null,
        },
      });

      if (existingRole) {
        throw new ValidationError(
          "Role with this name already exists for the tenant"
        );
      }

      // Validate policies exist if provided
      if (policy_ids && policy_ids.length > 0) {
        const policies = await prisma.policy.findMany({
          where: {
            policy_id: { in: policy_ids.map((id) => parseInt(id)) },
            is_active: true,
          },
        });

        if (policies.length !== policy_ids.length) {
          throw new ValidationError(
            "One or more policies are invalid or inactive"
          );
        }
      }

      return await prisma.role.create({
        data: {
          ...roleData,
          ...(policy_ids &&
            policy_ids.length > 0 && {
              role_policies: {
                create: policy_ids.map((policy_id) => ({
                  policy_id: parseInt(policy_id),
                })),
              },
            }),
        },
        include: {
          role_policies: {
            include: {
              policy: {
                include: {
                  policy_permissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
          tenant: true,
          _count: {
            select: {
              admins: true,
              vendor_users: true,
              employees: true,
              role_policies: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError("Failed to create role", error);
    }
  }

  static async getRoles(filters = {}) {
    try {
      const normalizedFilters = {
        ...filters,
        page: Number(filters.page) || 1,
        limit: Number(filters.limit) || 10,
        is_active:
          filters.is_active === undefined
            ? undefined
            : filters.is_active === "true" || filters.is_active === true,
      };

      const {
        page,
        limit,
        tenant_id,
        is_active,
        search,
        sort_by = "created_at",
        sort_order = "desc",
        ...where
      } = normalizedFilters;

      const skip = (page - 1) * limit;

      const searchCondition = search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {};

      const prismaWhere = {
        ...where,
        ...searchCondition,
        ...(tenant_id && { tenant_id: parseInt(tenant_id) }),
        ...(is_active !== undefined && { is_active }),
      };

      const [roles, total] = await Promise.all([
        prisma.role.findMany({
          where: prismaWhere,
          include: {
            role_policies: {
              include: {
                policy: {
                  include: {
                    policy_permissions: {
                      include: { permission: true },
                    },
                  },
                },
              },
            },
            tenant: true,
            _count: {
              select: {
                admins: true,
                vendor_users: true,
                employees: true,
                role_policies: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { [sort_by]: sort_order },
        }),
        prisma.role.count({ where: prismaWhere }),
      ]);

      return {
        roles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new DatabaseError("Failed to fetch roles", error);
    }
  }

  static async getRoleById(role_id) {
    try {
      const role = await prisma.role.findUnique({
        where: { role_id: parseInt(role_id) },
        include: {
          role_policies: {
            include: {
              policy: {
                include: {
                  policy_permissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
          tenant: true,
          _count: {
            select: {
              admins: true,
              vendor_users: true,
              employees: true,
              role_policies: true,
            },
          },
        },
      });

      if (!role) {
        throw new NotFoundError("Role not found");
      }

      return role;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError("Failed to fetch role", error);
    }
  }

  static async updateRole(role_id, data) {
    try {
      const { policy_ids, ...roleData } = data;

      // Check if role exists
      const existingRole = await prisma.role.findUnique({
        where: { role_id: parseInt(role_id) },
      });

      if (!existingRole) {
        throw new NotFoundError("Role not found");
      }

      // Check for duplicate name if updating name
      if (roleData.name) {
        const duplicateRole = await prisma.role.findFirst({
          where: {
            name: roleData.name,
            tenant_id: roleData.tenant_id || existingRole.tenant_id,
            NOT: { role_id: parseInt(role_id) },
          },
        });

        if (duplicateRole) {
          throw new ValidationError(
            "Role with this name already exists for the tenant"
          );
        }
      }

      return await prisma.$transaction(async (tx) => {
        // Update role policies if provided
        if (policy_ids !== undefined) {
          // Remove existing policies
          await tx.rolePolicy.deleteMany({
            where: { role_id: parseInt(role_id) },
          });

          // Add new policies if provided
          if (policy_ids.length > 0) {
            // Validate policies exist
            const policies = await tx.policy.findMany({
              where: {
                policy_id: { in: policy_ids.map((id) => parseInt(id)) },
                is_active: true,
              },
            });

            if (policies.length !== policy_ids.length) {
              throw new ValidationError(
                "One or more policies are invalid or inactive"
              );
            }

            await tx.rolePolicy.createMany({
              data: policy_ids.map((policy_id) => ({
                role_id: parseInt(role_id),
                policy_id: parseInt(policy_id),
              })),
            });
          }
        }

        // Update role data
        return await tx.role.update({
          where: { role_id: parseInt(role_id) },
          data: {
            ...roleData,
            updated_at: new Date(),
          },
          include: {
            role_policies: {
              include: {
                policy: {
                  include: {
                    policy_permissions: {
                      include: {
                        permission: true,
                      },
                    },
                  },
                },
              },
            },
            _count: {
              select: {
                admins: true,
                vendor_users: true,
                employees: true,
                role_policies: true,
              },
            },
          },
        });
      });
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError("Failed to update role", error);
    }
  }

  static async deleteRole(role_id) {
    try {
      // Check if role exists
      const existingRole = await prisma.role.findUnique({
        where: { role_id: parseInt(role_id) },
        include: {
          admins: true,
          vendor_users: true,
          employees: true,
        },
      });

      if (!existingRole) {
        throw new NotFoundError("Role not found");
      }

      // Check if role is assigned to any users
      const totalUsers =
        existingRole.admins.length +
        existingRole.vendor_users.length +
        existingRole.employees.length;

      if (totalUsers > 0) {
        throw new ValidationError(
          "Cannot delete role as it is assigned to one or more users"
        );
      }

      // Check if it's a system role
      if (existingRole.is_system_role) {
        throw new ValidationError("Cannot delete system role");
      }

      return await prisma.role.delete({
        where: { role_id: parseInt(role_id) },
      });
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError("Failed to delete role", error);
    }
  }

  // Utility Methods
  static async getRolePermissions(role_id) {
    try {
      const role = await prisma.role.findUnique({
        where: { role_id: parseInt(role_id) },
        include: {
          role_policies: {
            include: {
              policy: {
                include: {
                  policy_permissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!role) {
        throw new NotFoundError("Role not found");
      }

      // Extract unique permissions from all policies
      const permissions = role.role_policies.flatMap((rolePolicy) =>
        rolePolicy.policy.policy_permissions.map((pp) => pp.permission)
      );

      // Remove duplicates
      const uniquePermissions = Array.from(
        new Map(permissions.map((p) => [p.permission_id, p])).values()
      );

      return uniquePermissions;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError("Failed to fetch role permissions", error);
    }
  }

  static async checkPermission(role_id, module, action) {
    try {
      const permissions = await this.getRolePermissions(role_id);
      return permissions.some(
        (p) => p.module === module && p.action === action && p.is_active
      );
    } catch (error) {
      throw new DatabaseError("Failed to check permission", error);
    }
  }
}
