import type { Request, Response } from "express";
import {
  deleteReportByIdService,
  generateReportService,
  getReportByIdService,
  getReportsService,
  saveReportService,
} from "./report.service.js";
import { SaveReportSchema } from "./report.schema.js";

// 리포트 AI 생성
export async function generateReportController(req: Request, res: Response) {
  const result = await generateReportService(req.body);

  return res.status(201).json({
    success: true,
    message: "리포트 생성 완료",
    data: result,
  });
}

// 리포트 db 저장
export async function saveReportController(req: Request, res: Response) {
  const parsed = SaveReportSchema.parse(req.body);

  // 임시 userId
  const user_id = 0;
  const result = await saveReportService(parsed, user_id);

  return res.status(201).json({
    success: true,
    message: "리포트 저장 완료",
    data: result,
  });
}

// 리포트 삭제
export async function deleteReportController(req: Request, res: Response) {
  const id = Number(req.params.id);

  // 임시 userId
  const user_id = 0;

  if (!id || isNaN(id)) {
    return res.status(400).json({
      message: "유효한 id가 필요합니다",
    });
  }

  const result = await deleteReportByIdService(id, user_id);

  return res.status(204).json({
    success: true,
    message: "리포트 삭제 완료",
    data: result,
  });
}

// id 리포트 불러오기
export async function getReportByIdController(req: Request, res: Response) {
  const id = Number(req.params.id);

  // 임시 userId
  const user_id = 0;

  if (!id || isNaN(id)) {
    return res.status(400).json({
      message: "유효한 id가 필요합니다",
    });
  }

  const result = await getReportByIdService(id, user_id);

  return res.status(200).json({
    success: true,
    message: "리포트(id) 조회 완료",
    data: result,
  });
}

// 리포트 목록 조회
export async function getReportsController(req: Request, res: Response) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const sortBy = (req.query.sortBy as string) || "created_at";
  const order = (req.query.order as string) || "desc";
  const type = req.query.type as string | undefined;

  // 임시 userId
  const user_id = 0;

  const result = await getReportsService({
    user_id,
    page,
    limit,
    sortBy,
    order,
    type,
  });

  return res.status(200).json({
    success: true,
    message: "리포트 목록 조회 완료",
    data: result,
  });
}
