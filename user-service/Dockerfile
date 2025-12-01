
FROM node:23.9.0-alpine AS base
WORKDIR /app

COPY shared/zod-user-service   ./shared/zod-user-service
COPY database/db         ./database/db
COPY user-service/package*.json   ./user-service/

WORKDIR /app/shared/zod-user-service
RUN npm i 



FROM base as dev 
EXPOSE 4003
WORKDIR /app/user-service
RUN npm i 
COPY user-service/ ./
CMD ["npm", "run", "dev"]


FROM base as production
EXPOSE 4003
WORKDIR /app/user-service
RUN npm ci --only=production
COPY user-service/ ./
CMD ["npm", "run", "start"]



