########################
# BASE IMAGE (COMMON)
########################
FROM node:23-alpine AS base
WORKDIR /app

# Copy package.json and package-lock.json
COPY packages/service-tenant/package*.json ./

# Copy local packages BEFORE npm install so npm can resolve file: dependencies
COPY shared/middleware ./shared/middleware
COPY packages/database/db ./packages/database/db

# Install ALL deps (dev + prod), including local packages
RUN npm install

# Copy service code
COPY packages/service-tenant ./
COPY shared/tenantServices ./shared/tenantServices


########################
# DEV IMAGE
########################
FROM base AS dev
EXPOSE 4002
CMD ["npm", "run", "dev"]


########################
# BUILDER IMAGE (PROD BUILD)
########################
FROM node:23-alpine AS builder
WORKDIR /app

# Copy package.json and lock file
COPY packages/service-tenant/package*.json ./

# Copy local packages BEFORE npm install
COPY shared/middleware ./shared/middleware
COPY packages/database/db ./packages/database/db

# Install only production dependencies
RUN npm ci --only=production

# Copy service code and tenantServices
COPY packages/service-tenant ./
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
