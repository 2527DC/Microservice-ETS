########################
# BASE IMAGE (COMMON)
########################
FROM node:23.9.0-alpine AS base
WORKDIR /app

# Install system dependencies required for Prisma
RUN apk add --no-cache bash libc6-compat openssl

# Copy package.json for service-user (for caching)
COPY packages/service-user/package*.json ./packages/service-user/

# Copy shared packages
COPY shared/middleware ./shared/middleware
COPY shared/userServices ./shared/userServices

# Copy database folder (db + prisma schema)
COPY packages/database/db ./packages/database/db
COPY packages/database/prisma ./packages/database/prisma

# Install dependencies for shared packages first
WORKDIR /app/shared/userServices
RUN npm install

WORKDIR /app/shared/middleware
RUN npm install

# Install dependencies for service-user
WORKDIR /app/packages/service-user
RUN npm install

# Copy service code
COPY packages/service-user ./

# Generate Prisma client for Linux inside container
WORKDIR /app
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma

########################
# DEV IMAGE
########################
FROM base AS dev
WORKDIR /app/packages/service-user
EXPOSE 4001
CMD ["npm", "run", "dev"]

########################
# STAGING IMAGE
########################
FROM node:23.9.0-alpine AS staging
WORKDIR /app

# Copy everything from base stage
COPY --from=base /app /app

WORKDIR /app/packages/service-user

# Install only production dependencies for staging
RUN npm ci --only=production --ignore-scripts

# Generate Prisma client for staging
WORKDIR /app
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma

EXPOSE 4001
CMD ["npm", "run", "start:staging"]

########################
# PRODUCTION IMAGE
########################
FROM node:23.9.0-alpine AS production
WORKDIR /app

# Copy everything from staging stage
COPY --from=staging /app /app

WORKDIR /app/packages/service-user

# Ensure production dependencies (redundant, safe)
RUN npm ci --only=production --ignore-scripts

# Generate Prisma client for production
WORKDIR /app
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma

EXPOSE 4001
CMD ["npm", "run", "start"]
