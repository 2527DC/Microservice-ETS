// middleware/validationMiddleware.js
import * as schemas from "../userServices/iamSchemas.js";

/**
 * Generic validation middleware factory
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @param {string} type - Validation type ('body', 'params', 'query')
 */
export const validate = (schema, type = "body") => {
  return (req, res, next) => {
    try {
      const data = req[type];
      const result = schema.parse(data);
      req[type] = result; // Replace with validated data
      next();
    } catch (error) {
      console.error("Validation error:", error.errors);

      res.status(400).json({
        success: false,
        error: "Validation failed",
        message: "Please check your input data",
        details: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        })),
      });
    }
  };
};

// Permission specific validation middleware
export const validatePermission = {
  create: validate(schemas.permissionCreateSchema, "body"),
  update: validate(schemas.permissionUpdateSchema, "body"),
  id: validate(schemas.permissionIdSchema, "params"),
  query: validate(schemas.queryParamsSchema, "query"),
};

// Policy specific validation middleware
export const validatePolicy = {
  create: validate(schemas.policyCreateSchema, "body"),
  update: validate(schemas.policyUpdateSchema, "body"),
  id: validate(schemas.policyIdSchema, "params"),
  query: validate(schemas.queryParamsSchema, "query"),
};

// Role specific validation middleware
export const validateRole = {
  create: validate(schemas.roleCreateSchema, "body"),
  update: validate(schemas.roleUpdateSchema, "body"),
  id: validate(schemas.roleIdSchema, "params"),
  query: validate(schemas.queryParamsSchema, "query"),
};

// Common validation middleware
export const validateCommon = {
  query: validate(schemas.queryParamsSchema, "query"),
};

/**
 * Async validation middleware for custom validation logic
 */
export const asyncValidate = (schema, type = "body") => {
  return async (req, res, next) => {
    try {
      const data = req[type];
      const result = await schema.parseAsync(data);
      req[type] = result;
      next();
    } catch (error) {
      console.error("Async validation error:", error.errors);

      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }
  };
};

/**
 * Partial validation for PATCH requests
 */
export const validatePartial = (schema, type = "body") => {
  return (req, res, next) => {
    try {
      const data = req[type];
      // For PATCH requests, we want to validate only provided fields
      const partialSchema = schema.partial();
      const result = partialSchema.parse(data);
      req[type] = result;
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }
  };
};

/**
 * Validation middleware that collects all errors instead of failing fast
 */
export const validateWithAllErrors = (schema, type = "body") => {
  return (req, res, next) => {
    try {
      const data = req[type];
      const result = schema.parse(data);
      req[type] = result;
      next();
    } catch (error) {
      // Zod already collects all errors by default
      res.status(400).json({
        success: false,
        error: "Multiple validation errors",
        details: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        })),
      });
    }
  };
};

/**
 * Sanitization middleware to remove extra fields
 */
export const sanitizeData = (allowedFields = []) => {
  return (req, res, next) => {
    if (req.body && allowedFields.length > 0) {
      const sanitizedBody = {};
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          sanitizedBody[field] = req.body[field];
        }
      });
      req.body = sanitizedBody;
    }
    next();
  };
};

// Export the main validate function as default
export default validate;
