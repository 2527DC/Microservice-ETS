// schemas/adminSchemas.js
import { z } from "zod";

// Base schemas
const idSchema = z.string().regex(/^\d+$/, "ID must be a positive integer");

const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(150, "Name must not exceed 150 characters");

const emailSchema = z
  .string()
  .email("Valid email is required")
  .max(150, "Email must not exceed 150 characters");

const phoneSchema = z
  .string()
  .min(1, "Phone is required")
  .max(20, "Phone must not exceed 20 characters");

const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters long")
  .max(255, "Password must not exceed 255 characters");

const roleIdSchema = z
  .number()
  .int("Role ID must be an integer")
  .positive("Role ID must be positive");

const isActiveSchema = z.boolean().optional().default(true);

// Query parameters schema
export const queryParamsSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default("1"),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default("10"),
  search: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional().default("asc"),
});

// Admin ID schema for params
export const adminIdSchema = z.object({
  id: idSchema,
});

// Create admin schema
export const adminCreateSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  role_id: roleIdSchema,
  is_active: isActiveSchema,
});

// Update admin schema
export const adminUpdateSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  password: passwordSchema.optional(),
  role_id: roleIdSchema.optional(),
  is_active: isActiveSchema.optional(),
});

// Partial update schema (for PATCH)
export const adminPartialUpdateSchema = adminUpdateSchema.partial();

// Login schema (if needed)
export const adminLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// Change password schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
  });

// Export all schemas
export const adminSchemas = {
  create: adminCreateSchema,
  update: adminUpdateSchema,
  partialUpdate: adminPartialUpdateSchema,
  id: adminIdSchema,
  query: queryParamsSchema,
  login: adminLoginSchema,
  changePassword: changePasswordSchema,
};

export default adminSchemas;
