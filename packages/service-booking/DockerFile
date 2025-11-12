# Base Image
FROM node:23.9.0 AS base
WORKDIR /app

# Copy package.json and lock file
COPY package*.json package-lock.json ./

# Install all dependencies
RUN npm install

# Copy app source
COPY . .

# -------------------
# Development Stage
FROM base AS development
EXPOSE 3001
CMD ["npm", "run", "dev"]

# -------------------
# Production Stage
FROM node:23.9.0 AS production
WORKDIR /app

# Copy only needed files
COPY package*.json package-lock.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy source code from base stage
COPY --from=base /app ./

EXPOSE 3001
CMD ["npm", "start"]
