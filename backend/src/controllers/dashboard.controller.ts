import { Request, Response } from "express";

export const getStats = async (req: Request, res: Response) => {
  // TODO: Implement real stats logic
  res.json({
    users: 0,
    documents: 0,
    categories: 0,
    notifications: 0,
    message: "Dashboard stats placeholder"
  });
};
