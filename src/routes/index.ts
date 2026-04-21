import { Router } from "express";
import { reportRoutes } from "../modules/report/report.routes.js";
import { authRoutes } from "../modules/auth/auth.routes.js";

export const router = Router();

router.use("/reports", reportRoutes);
router.use("/auth", authRoutes);
