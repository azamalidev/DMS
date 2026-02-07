import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Document } from "../entities/Document";
import { Category } from "../entities/Category";
import { Notification } from "../entities/Notification";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  entities: [User, Document, Category, Notification],
});
