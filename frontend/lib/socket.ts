import { io, Socket } from "socket.io-client";

export let socket: Socket;

export const connectSocket = (token: string, userId: string) => {
  if (socket && socket.connected) return;

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
    auth: { token },
    autoConnect: true,
  });

  socket.on("connect", () => {
    console.log("Connected to socket:", socket.id);

    // Join user-specific room
    socket.emit("joinRoom", userId);
  });

  socket.on("document:deleted", (data: { id: string }) => {
    console.log("Received document:deleted event:", data);


  });

  socket.on("document:updated", (data: { id: string }) => {

    console.log("Received document:updated event:", data);

  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });
};

export const getSocket = (): Socket | undefined => socket;
