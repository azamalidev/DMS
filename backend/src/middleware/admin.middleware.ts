import { Request, Response, NextFunction } from "express";

export const adminMiddleware = (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
};

export default adminMiddleware;
