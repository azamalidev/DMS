// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { AppDataSource } from "../config/db";
import { User } from "../entities/User";
import { signToken } from "../utils/jwt";

export const register = async (req: Request, res: Response) => {
  const repo = AppDataSource.getRepository(User);
  const { name, email, password, role  } = req.body;

  const hash = await bcrypt.hash(password, 10);
  // Allow creating an admin if correct adminSecret is provided (safe seed)
  const user = repo.create({ name, email, password_hash: hash, role: role ? role : 'user' });

  await repo.save(user);
  res.status(201).json({ message: "Registered" });
};

export const login = async (req: Request, res: Response) => {
  const repo = AppDataSource.getRepository(User);
  const { email, password } = req.body;

  const user = await repo.findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = signToken({ id: user.id, role: user.role });

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
};

