import activeUsersRoutes from "./routes/activeUsers.routes";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import docRoutes from "./routes/document.routes";
import categoryRoutes from "./routes/category.routes";
import notifyRoutes from "./routes/notification.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import userRoutes from "./routes/user.routes";


const app = express();

app.use(cors());

app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/documents", docRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/notifications", notifyRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/active-users", activeUsersRoutes);

app.get("/api/health", (_, res) => res.json({ status: "ok" }));

export default app;
