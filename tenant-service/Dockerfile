
FROM node:23-alpine AS base
WORKDIR /app

# Copy package.json and package-lock.json
COPY tenant-service/package*.json ./tenant-service/

# Copy local packages BEFORE npm install so npm can resolve file: dependencies
COPY database/db ./database/db

# Install ALL deps (dev + prod), including local packages

# Copy service code
WORKDIR /app/tenant-service
RUN npm install
COPY tenant-service ./

COPY shared/tenantServices ./shared/tenantServices


########################
# DEV IMAGE
########################
FROM base AS dev
EXPOSE 4002
WORKDIR /app/tenant-service
CMD ["npm", "run", "dev"]


########################
# BUILDER IMAGE (PROD BUILD)
########################
FROM node:23-alpine AS builder
WORKDIR /app

# Copy package.json and lock file
COPY tenant-service/package*.json ./

# Copy local packages BEFORE npm install
COPY database/db ./database/db

# Install only production dependencies
RUN npm ci --only=production

# Copy service code and tenantServices
COPY tenant-service ./
COPY shared/tenantServices ./shared/tenantServices


########################
# PRODUCTION IMAGE
########################
FROM node:23-alpine AS production
WORKDIR /app

# Copy everything from builder
COPY --from=builder /app ./

EXPOSE 4002
CMD ["npm", "run", "start"]
