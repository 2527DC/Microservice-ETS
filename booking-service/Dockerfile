FROM node:23-alphine as base 
WORKDIR  /app

#  copy the necessary code  and folders 
COPY  booking-service/package*.json  ./booking-services/
COPY  shared/zod-booking-service    ./shared/zod-booking-service
COPY  shared/middleware         ./shared/middlewares
COPY  database/db      ./db

