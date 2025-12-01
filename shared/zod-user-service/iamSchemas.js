// schemas/iamSchemas.js
import { z } from "zod";

// Custom validators
const isFutureDate = (date) => new Date(date) > new Date();
const isStrongPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
    password
  );

// Extended schemas with custom validation
export const permissionCreateSchema = z
  .object({
    module: z
      .string()
      .min(1, "Module name is required")
      .max(100, "Module name must be less than 100 characters")
      .regex(
        /^[a-zA-Z_][a-zA-Z0-9_]*$/,
        "Module name can only contain letters, numbers and underscores"
      ),
    action: z
      .string()
      .min(1, "Action is required")
      .max(50, "Action must be less than 50 characters")
      .regex(
        /^[a-z_]+$/,
        "Action can only contain lowercase letters and underscores"
      ),
    description: z
      .string()
      .max(255, "Description must be less than 255 characters")
      .optional()
      .nullable(),
    is_active: z.boolean().default(true),
  })
  .refine((data) => !data.description || data.description.length <= 255, {
    message: "Description too long",
    path: ["description"],
  });

export const permissionUpdateSchema = permissionCreateSchema.partial();
export const permissionIdSchema = z.object({
  permission_id: z
    .string()
    .regex(/^\d+$/, "Permission ID must be a number")
    .transform(Number)
    .refine((n) => n > 0, "Permission ID must be positive"),
});

// Policy Schemas
export const policyCreateSchema = z
  .object({
    tenant_id: z
      .string()
      .max(50, "Tenant ID must be less than 50 characters")
      .optional()
      .nullable(),
    name: z
      .string()
      .min(1, "Policy name is required")
      .max(100, "Policy name must be less than 100 characters")
      .regex(
        /^[a-zA-Z0-9_\- ]+$/,
        "Policy name can only contain letters, numbers, spaces, hyphens and underscores"
      ),
    description: z
      .string()
      .max(255, "Description must be less than 255 characters")
      .optional()
      .nullable(),
    is_active: z.boolean().default(true),
    is_system_policy: z.boolean().default(false),
    permission_ids: z
      .array(z.number().int().positive("Permission ID must be positive"))
      .optional(),
  })
  .refine(
    (data) => {
      if (data.permission_ids && data.permission_ids.length > 100) {
        return false;
      }
      return true;
    },
    {
      message: "Cannot assign more than 100 permissions to a policy",
      path: ["permission_ids"],
    }
  );

export const policyUpdateSchema = policyCreateSchema.partial();
export const policyIdSchema = z.object({
  policy_id: z
    .string()
    .regex(/^\d+$/, "Policy ID must be a number")
    .transform(Number)
    .refine((n) => n > 0, "Policy ID must be positive"),
});

// Role Schemas
export const roleCreateSchema = z
  .object({
    name: z
      .string()
      .min(1, "Role name is required")
      .max(100, "Role name must be less than 100 characters")
      .regex(
        /^[a-zA-Z0-9_\- ]+$/,
        "Role name can only contain letters, numbers, spaces, hyphens and underscores"
      ),
    description: z
      .string()
      .max(255, "Description must be less than 255 characters")
      .optional()
      .nullable(),
    is_active: z.boolean().default(true),
    tenant_id: z
      .string()
      .max(50, "Tenant ID must be less than 50 characters")
      .optional()
      .nullable(),
    is_system_role: z.boolean().default(false),
    policy_ids: z
      .array(z.number().int().positive("Policy ID must be positive"))
      .optional(),
  })
  .refine(
    (data) => {
      if (data.policy_ids && data.policy_ids.length > 50) {
        return false;
      }
      return true;
    },
    {
      message: "Cannot assign more than 50 policies to a role",
      path: ["policy_ids"],
    }
  );

export const roleUpdateSchema = roleCreateSchema.partial();
export const roleIdSchema = z.object({
  role_id: z
    .string()
    .regex(/^\d+$/, "Role ID must be a number")
    .transform(Number)
    .refine((n) => n > 0, "Role ID must be positive"),
});

// Common Schemas
export const queryParamsSchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, "Page must be a number")
    .transform(Number)
    .refine((n) => n > 0, "Page must be positive")
    .default("1"),
  limit: z
    .string()
    .regex(/^\d+$/, "Limit must be a number")
    .transform(Number)
    .refine((n) => n > 0 && n <= 100, "Limit must be between 1 and 100")
    .default("10"),
  tenant_id: z.string().max(50).optional(),
  is_active: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  search: z.string().max(100).optional(),
  sort_by: z.string().max(50).optional(),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
});

// Bulk operation schemas
export const bulkDeleteSchema = z.object({
  ids: z
    .array(z.number().int().positive("ID must be positive"))
    .min(1, "At least one ID is required")
    .max(100, "Cannot delete more than 100 items at once"),
});

export const bulkUpdateSchema = z.object({
  ids: z
    .array(z.number().int().positive("ID must be positive"))
    .min(1, "At least one ID is required")
    .max(100, "Cannot update more than 100 items at once"),
  data: z.object({}).passthrough(), // Accept any object for update data
});
