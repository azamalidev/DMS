import { Request, Response } from "express";
import { AppDataSource } from "../config/db";
import { Category } from "../entities/Category";
import { getIo } from "../sockets/socket";

const categoryRepo = AppDataSource.getRepository(Category);

export const createCategory = async (req: Request, res: Response) => {
  const { name, color } = req.body;

  const category = categoryRepo.create({ name, color });
  await categoryRepo.save(category);

  // emit category created event to all connected clients
  try {
    const io = getIo();
    io.emit("category:created", category);
  } catch (err) {
    // ignore if socket not initialized
    console.warn("Socket not initialized, skipping category emit");
  }

  res.status(201).json(category);
};

export const getCategories = async (_: Request, res: Response) => {
  const categories = await categoryRepo.find();
  res.json({ categories });
};
