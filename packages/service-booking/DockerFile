# Base Image
FROM node:23.9.0 AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Development Stage
FROM base AS development
EXPOSE 3001
CMD ["npm", "run", "dev"]

# Production Stage
FROM node:23.9.0 AS production
WORKDIR /app

# Copy only needed files from base stage
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy compiled app / source code
COPY --from=base /app ./

EXPOSE 3001
CMD ["npm", "start"]