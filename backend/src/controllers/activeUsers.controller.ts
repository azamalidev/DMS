import { Request, Response } from "express";
import { getActiveUsers } from "../sockets/socket";

export const getActiveUsersApi = async (req: Request, res: Response) => {
  // Only admin can access
  if (req.user?.role !== "admin") return res.status(403).json({ message: "Forbidden" });
  res.json({ activeUsers: getActiveUsers() });
};
