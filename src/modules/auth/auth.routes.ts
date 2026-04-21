import { Router } from "express";
import {
  localLoginController,
  socialLoginController,
} from "./auth.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const authRoutes = Router();

authRoutes.post("/login", asyncHandler(localLoginController));
authRoutes.post("/social", asyncHandler(socialLoginController));
