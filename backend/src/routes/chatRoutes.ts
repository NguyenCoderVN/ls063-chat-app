import { Router } from "express";

import { protectRoute } from "../middleware/auth";
import {
  getOrCreateChat,
  getChats,
} from "../controllers/chatController";

export const chatRoutes = Router();

chatRoutes.use(protectRoute);
chatRoutes.get("/", getChats);
chatRoutes.post("/with/:participantId", getOrCreateChat);
