import { prisma } from "db";

export const getusers = async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
};
