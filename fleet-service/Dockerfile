
FROM node:23.9.0-alpine AS base
WORKDIR /app

COPY database/db         ./database/db
COPY fleet-service/package*.json   ./fleet-service/




FROM base as dev 
EXPOSE 4003
WORKDIR /app/fleet-service
RUN npm i 
COPY fleet-service/ ./
CMD ["npm", "run", "dev"]


FROM base as production
EXPOSE 4003
WORKDIR /app/fleet-service
RUN npm ci --only=production
COPY fleet-service/ ./
CMD ["npm", "run", "start"]



