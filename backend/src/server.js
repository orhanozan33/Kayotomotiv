import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get("/api/auto-sales", async (req, res) => {
  const data = await prisma.autoSale.findMany();
  res.json(data);
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) return res.status(401).json({ error: "User not found" });

  const ok = await bcrypt.compare(password, admin.password);
  if (!ok) return res.status(401).json({ error: "Wrong password" });

  const token = jwt.sign(
    { id: admin.id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ token });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log("Backend running on", PORT));
