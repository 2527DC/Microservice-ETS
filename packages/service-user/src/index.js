// app.js (updated)

// import "./utils/setupAlias.js";
import express from "express";
import dotenv from "dotenv";
// import cors from "cors";
// import helmet from "helmet";
// import morgan from "morgan";
// import rateLimit from "express-rate-limit";

import rootRoute from "./routes/index.route.js";

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
// app.use(
//   helmet({
//     crossOriginResourcePolicy: { policy: "cross-origin" },
//   })
// );

// CORS configuration
// app.use(
//   cors({
//     origin: process.env.ALLOWED_ORIGINS?.split(",") || [
//       "http://localhost:3000",
//     ],
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//     allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
//   })
// );

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100,
//   message: {
//     success: false,
//     error: "Too many requests from this IP, please try again later.",
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// app.use(limiter);

// Logging middleware
// app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Body parsing middleware
app.use(
  express.json({
    limit: "10mb",
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

// app.use(
//   express.urlencoded({
//     extended: true,
//     limit: "10mb",
//   })
// );

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "User service is running healthy!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.use("/api", rootRoute);

// app.use("/api", IAM);

// API routes
// app.use("/api/v1/users", router);

// 404 handler for unmatched routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
    message: "Please check the API documentation",
  });
});

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error("🚨 Error:", error);

  // Handle Zod validation errors
  if (error.name === "ZodError") {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      })),
    });
  }

  // Handle Prisma errors
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

  // Handle JWT errors
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      error: "Invalid token",
      message: "Please provide a valid authentication token",
    });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      error: "Token expired",
      message: "Please login again",
    });
  }

  // Default error response
  const statusCode = error.statusCode || error.status || 500;
  const message = error.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    error:
      process.env.NODE_ENV === "production" ? "Internal server error" : message,
    ...(process.env.NODE_ENV !== "production" && { stack: error.stack }),
  });
});

// Graceful shutdown handling
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});

// Unhandled promise rejection handler
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Uncaught exception handler
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

const PORT = process.env.PORT || 4001;
const HOST = process.env.HOST || "localhost";

app.listen(PORT, HOST, () => {
  console.log(`👤 User service running at http://${HOST}:${PORT}`);
  console.log(`🏥 Health check: http://${HOST}:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

export default app;
