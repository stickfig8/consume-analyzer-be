import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  deleteReportController,
  generateReportController,
  getReportByIdController,
  getReportsController,
  saveReportController,
} from "./report.controller.js";

export const reportRoutes = Router();

reportRoutes.post("/generate", asyncHandler(generateReportController));

reportRoutes.post("/save", asyncHandler(saveReportController));

reportRoutes.delete("/:id", asyncHandler(deleteReportController));

reportRoutes.get("/:id", asyncHandler(getReportByIdController));

reportRoutes.get("/", asyncHandler(getReportsController));
