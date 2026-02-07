import "reflect-metadata";
import dotenv from "dotenv";
import { initSocket } from "./sockets/socket";
dotenv.config();

import http from "http";
import app from "./app";
import { AppDataSource } from "./config/db";
import { Server } from "socket.io";

const server = http.createServer(app);

const io = initSocket(server);

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");
    server.listen(process.env.PORT, () => {
      console.log(`Server running on ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB Error", err);
  });
