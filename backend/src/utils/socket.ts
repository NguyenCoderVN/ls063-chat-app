import { verifyToken } from "@clerk/express";
import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import { Message } from "../models/Message";
import { User } from "../models/User"; // Ensure this is imported
import { Chat } from "../models/Chat"; // Ensure this is imported

export const onlineUsers: Map<string, string> = new Map();

export const initializeSocket = (httpServer: HttpServer) => {
  const allowedOrigins = [
    "http://localhost:8081",
    "http://localhost:5173",
    process.env.FRONTEND_URL,
  ].filter(Boolean) as string[]; // Clean up undefined values

  const io = new SocketServer(httpServer, {
    cors: {
      origin: allowedOrigins,
    },
  });

  // Authentication Middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token)
      return next(
        new Error("Authentication error: No token provided"),
      );

    try {
      const session = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });

      const clerkId = session.sub;

      const user = await User.findOne({ clerkId });
      if (!user) return next(new Error("User not found"));

      // Cast socket and attach userId
      socket.data.userId = user._id.toString();
      next();
    } catch (error: any) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId;

    // Track online status
    onlineUsers.set(userId, socket.id);

    // Notify others and send current online list to the user
    socket.emit("online-users", {
      userIds: Array.from(onlineUsers.keys()),
    });
    socket.broadcast.emit("user-online", { userId });

    // Join a private room for targeted notifications
    socket.join(`user:${userId}`);

    socket.on("join-chat", (chatId: string) => {
      socket.join(`chat:${chatId}`);
    });

    socket.on("leave-chat", (chatId: string) => {
      socket.leave(`chat:${chatId}`);
    });

    socket.on(
      "send-message",
      async (data: { chatId: string; text: string }) => {
        try {
          const { chatId, text } = data;

          const chat = await Chat.findOne({
            _id: chatId,
            participants: userId,
          });

          if (!chat) {
            socket.emit("socket-error", {
              message: "Chat not found or access denied",
            });
            return;
          }

          const message = await Message.create({
            chat: chatId,
            sender: userId,
            text,
          });

          // Update Chat metadata
          chat.lastMessage = message._id;
          chat.lastMessageAt = new Date();
          await chat.save();

          await message.populate("sender", "name avatar");

          io.to(`chat:${chatId}`).emit("new-message", message);

          chat.participants.forEach((pId) => {
            if (pId.toString() !== userId) {
              io.to(`user:${pId}`).emit(
                "message-notification",
                message,
              );
            }
          });
        } catch (error) {
          console.error("Socket Message Error:", error);
          socket.emit("socket-error", {
            message: "Failed to send message",
          });
        }
      },
    );

    socket.on("typing", (data: { chatId: string }) => {
      socket
        .to(`chat:${data.chatId}`)
        .emit("user-typing", { userId, chatId: data.chatId });
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      socket.broadcast.emit("user-offline", { userId });
    });
  });
};
