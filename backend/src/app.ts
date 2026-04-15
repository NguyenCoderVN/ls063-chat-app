import express from "express";
import { clerkMiddleware } from "@clerk/express";
import { errorHandler } from "./middleware/errorHandler";
import { authRoutes } from "./routes/authRoutes";
import { chatRoutes } from "./routes/chatRoutes";
import { messageRoutes } from "./routes/messageRoutes";
import { userRouters } from "./routes/userRoutes";

const app = express();

app.get("/health", (_, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.use(express.json());
app.use(clerkMiddleware());
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRouters);
app.use(errorHandler);

export default app;
