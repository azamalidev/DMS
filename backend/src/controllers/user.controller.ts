import { Request, Response } from "express";
import { AppDataSource } from "../config/db";
import { User } from "../entities/User";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(User);
    const users = await repo.find({ select: ["id", "name", "email", "role"] });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};
