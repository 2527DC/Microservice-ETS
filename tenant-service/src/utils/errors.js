// utils/errors.js
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed") {
    super(message, 400);
  }
}

export class DatabaseError extends AppError {
  constructor(message = "Database operation failed", originalError = null) {
    super(message, 500);
    this.originalError = originalError;
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Access denied") {
    super(message, 403);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401);
  }
}

export function handleControllerError(res, error) {
  console.error("❌ Controller Error:", error);

  // Custom error response handling
  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: error.message || "Validation failed",
    });
  }

  if (error.name === "NotFoundError") {
    return res.status(404).json({
      success: false,
      message: error.message || "Resource not found",
    });
  }

  if (error.name === "DatabaseError") {
    return res.status(500).json({
      success: false,
      message: error.message || "Database operation failed",
    });
  }

  // Fallback for unhandled errors
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
}
