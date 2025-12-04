
FROM node:23.9.0-alpine AS base
WORKDIR /app


COPY database/db         ./database/db
COPY user-service/package*.json   ./user-service/


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



