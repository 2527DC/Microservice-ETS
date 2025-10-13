#!/bin/bash

# ============================================
#  EXPRESS + PRISMA + POSTGRES (Shared DB)
#  Multi-service setup (npm-compatible)
# ============================================

echo "🚀 Creating Express + Prisma microservice structure (PostgreSQL)..."

# Root folders
mkdir -p prisma
mkdir -p packages/db
mkdir -p packages/service-user/src
mkdir -p packages/service-booking/src

# ---------------------------
# 1️⃣ Root package.json
# ---------------------------
cat <<EOF > package.json
{
  "name": "microservice-root",
  "private": true,
  "scripts": {
    "migrate": "npx prisma migrate dev",
    "dev:user": "node packages/service-user/src/index.js",
    "dev:booking": "node packages/service-booking/src/index.js"
  },
  "devDependencies": {
    "prisma": "^6.0.0"
  },
  "dependencies": {
    "@prisma/client": "^6.0.0"
  }
}
EOF

# ---------------------------
# 2️⃣ Prisma schema (PostgreSQL)
# ---------------------------
cat <<EOF > prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  output   = "../packages/db/generated"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  bookings  Booking[]
}

model Booking {
  id        Int      @id @default(autoincrement())
  userId    Int
  details   String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}
EOF

# ---------------------------
# 3️⃣ Shared Prisma client (db package)
# ---------------------------
cat <<EOF > packages/db/index.js
import { PrismaClient } from "./generated/client/index.js";

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["warn", "error"]
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
EOF

# ---------------------------
# 4️⃣ db package.json
# ---------------------------
cat <<EOF > packages/db/package.json
{
  "name": "db",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js"
}
EOF

# ---------------------------
# 5️⃣ User Service
# ---------------------------
cat <<EOF > packages/service-user/package.json
{
  "name": "service-user",
  "version": "1.0.0",
  "type": "module",
  "main": "src/index.js",
  "dependencies": {
    "express": "^4.19.2",
    "dotenv": "^16.4.0",
    "db": "file:../db"
  }
}
EOF

cat <<EOF > packages/service-user/.env
DATABASE_URL="postgresql://postgres:password@localhost:5432/microdb?schema=public"
NODE_ENV=development
EOF

cat <<EOF > packages/service-user/src/index.js
import express from "express";
import dotenv from "dotenv";
import { prisma } from "db";

dotenv.config();
const app = express();
app.use(express.json());

app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.post("/users", async (req, res) => {
  const { name, email, password } = req.body;
  const user = await prisma.user.create({ data: { name, email, password } });
  res.json(user);
});

app.listen(4001, () => console.log("👤 User service running at http://localhost:4001"));
EOF

# ---------------------------
# 6️⃣ Booking Service
# ---------------------------
cat <<EOF > packages/service-booking/package.json
{
  "name": "service-booking",
  "version": "1.0.0",
  "type": "module",
  "main": "src/index.js",
  "dependencies": {
    "express": "^4.19.2",
    "dotenv": "^16.4.0",
    "db": "file:../db"
  }
}
EOF

cat <<EOF > packages/service-booking/.env
DATABASE_URL="postgresql://postgres:password@localhost:5432/microdb?schema=public"
NODE_ENV=development
EOF

cat <<EOF > packages/service-booking/src/index.js
import express from "express";
import dotenv from "dotenv";
import { prisma } from "db";

dotenv.config();
const app = express();
app.use(express.json());

app.get("/bookings", async (req, res) => {
  const bookings = await prisma.booking.findMany({ include: { user: true } });
  res.json(bookings);
});

app.post("/bookings", async (req, res) => {
  const { userId, details } = req.body;
  const booking = await prisma.booking.create({
    data: { userId: Number(userId), details }
  });
  res.json(booking);
});

app.listen(4002, () => console.log("📘 Booking service running at http://localhost:4002"));
EOF

# ---------------------------
# 7️⃣ Root .env
# ---------------------------
cat <<EOF > .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/microdb?schema=public"
EOF

# ---------------------------
# ✅ Done
# ---------------------------
echo "✅ Microservice setup complete!"
echo "Next steps:"
echo "1️⃣ Update DATABASE_URL in .env files with your real Postgres credentials"
echo "2️⃣ Run: npm install"
echo "3️⃣ Run: npx prisma migrate dev --name init"
echo "4️⃣ Start services: npm run dev:user  &  npm run dev:booking"
