# ---------------------------
# Base Stage
# ---------------------------
    FROM node:23.9.0-alpine AS base

    WORKDIR /app
    
    # Copy only package files first for layer caching
    COPY package*.json ./
    
    # Install all dependencies (including dev, for building)
    RUN npm install
    
    # Copy the rest of the source code
    COPY . .
    
    
    # ---------------------------
    # Development Stage
    # ---------------------------
    FROM base AS development
    EXPOSE 4001
    CMD ["npm", "run", "dev"]
    
    # ---------------------------
    # Production Stage
    # ---------------------------
    FROM node:23.9.0-alpine AS production
    
    WORKDIR /app
    
    # Copy only production dependencies
    COPY package*.json ./
    RUN npm ci --only=production
    
    # Copy required files from base stage
    COPY --from=base /app/src ./src
    COPY --from=base /app/shared ./shared
    COPY --from=base /app/package.json ./
    COPY --from=base /app/tsconfig.json ./
    COPY --from=base /app/.env ./
    
    # Ensure Prisma client is present (optional redundancy)
    # RUN npx prisma generate
    
    EXPOSE 4001
    CMD ["npm", "start"]
    