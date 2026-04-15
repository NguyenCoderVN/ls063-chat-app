import { Router } from "express";
import { protectRoute } from "../middleware/auth";
import { getMe } from "../controllers/authController";
import { authCallback } from "../controllers/authController";

export const authRoutes = Router();

authRoutes.get("/me", protectRoute, getMe);
authRoutes.post("/callback", authCallback);
