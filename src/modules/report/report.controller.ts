import type { Request, Response } from "express";
import { generateReportService, saveReportService } from "./report.service.js";
import { SaveReportSchema } from "./report.schema.js";

// 리포트 AI 생성
export async function generateReportController(req: Request, res: Response) {
  const result = await generateReportService(req.body);

  return res.status(200).json({
    success: true,
    data: result,
  });
}

// 리포트 db 저장
export async function saveReportController(req: Request, res: Response) {
  const parsed = SaveReportSchema.parse(req.body);

  const userId = 0;
  const result = await saveReportService(parsed, userId);

  return res.status(200).json({
    success: true,
    data: result,
  });
}
