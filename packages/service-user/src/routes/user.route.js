import express from "express";
import { prisma } from "db";
import { getusers } from "../controller/userController.js";
const router = express.Router();

router.get("/users", getusers);

router.post("/users", async (req, res) => {
  const { name, email, password, address } = req.body;

  console.log("Creating user:", { name, email, address });
  try {
    const user = await prisma.user.create({
      data: { name, email, password, address },
    });
    res.json(user);
  } catch (error) {
    console.log("Error creating user:", error);
    res.status(500).json({ error: "Error creating user" });
  }
});

export default router;
