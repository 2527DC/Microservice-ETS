FROM node:23-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npx prisma generate
CMD ["npx", "prisma", "migrate", "deploy"]
