import { Router } from "express";
import { reportRoutes } from "../modules/report/report.routes.js";

export const router = Router();

router.use("/reports", reportRoutes);
