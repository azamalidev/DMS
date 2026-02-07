// socket.ts
import { Server } from "socket.io";

let io: Server;
// Track active users
const activeUsers = new Set<string>();

export const initSocket = (server: any) => {
  io = new Server(server, { cors: { origin: "*" } });
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinRoom", (userId: string) => {
      socket.join(userId);
      activeUsers.add(userId);
      io.emit("activeUsers", Array.from(activeUsers));
      console.log(`User ${userId} joined room`);
    });

    socket.on("disconnect", () => {
      // Remove user from activeUsers
      for (const userId of activeUsers) {
        if (socket.rooms.has(userId)) {
          activeUsers.delete(userId);
        }
      }
      io.emit("activeUsers", Array.from(activeUsers));
      console.log("User disconnected");
    });
  });
  return io;
};

export const getIo = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

// Export active users for API
export const getActiveUsers = () => Array.from(activeUsers);
