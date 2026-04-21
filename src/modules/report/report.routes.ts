import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  generateReportController,
  saveReportController,
} from "./report.controller.js";

export const reportRoutes = Router();

reportRoutes.post("/generate", asyncHandler(generateReportController));

reportRoutes.post("/save", asyncHandler(saveReportController));
