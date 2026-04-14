import { Router } from "express";
import { protectRoute } from "../middleware/auth";
import {
  getOrCreateChat,
  getChats,
} from "../controllers/chatController";

const router = Router();
router.use(protectRoute);
router.get("/", getChats);
router.post("/with/:participantId", getOrCreateChat);
export default router;
