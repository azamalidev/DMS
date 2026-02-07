import { Request, Response } from "express";
import { AppDataSource } from "../config/db";
import { Notification } from "../entities/Notification";

const notifRepo = AppDataSource.getRepository(Notification);

export const getNotifications = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id || req.params.userId;
    if (!userId) return res.status(400).json({ message: "No user id" });

    const notifications = await notifRepo.find({ where: { user_id: userId }, order: { created_at: "DESC" } });
    return res.json({ data: notifications });
  } catch (err) {
    console.error("getNotifications error:", err);
    return res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

export const markAsRead = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const notif = await notifRepo.findOne({ where: { id, user_id: userId } });
    if (!notif) return res.status(404).json({ message: "Not found" });
    notif.read = true;
    await notifRepo.save(notif);
    return res.json({ success: true });
  } catch (err) {
    console.error("markAsRead error:", err);
    return res.status(500).json({ message: "Failed to mark as read" });
  }
};

export default { getNotifications, markAsRead };
