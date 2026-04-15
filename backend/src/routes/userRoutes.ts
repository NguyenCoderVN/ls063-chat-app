import { Router } from "express";
import { protectRoute } from "../middleware/auth";
import { getUsers } from "../controllers/userController";

export const userRouters = Router();

userRouters.get("/", protectRoute, getUsers);
