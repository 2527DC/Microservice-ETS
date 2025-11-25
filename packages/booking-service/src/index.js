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
