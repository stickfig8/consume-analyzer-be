import { AppError } from "../../errors/AppError.js";
import type {
  ClassifiedExpense,
  Expense,
  LLMClassification,
  Period,
} from "../../types/types.js";
import { requestClassification, requestInsight } from "./report.ai.js";
import {
  calculateSummary,
  extractCandidates,
  calculateEmotion,
  calculateStructureType,
  calculateRiskLevel,
} from "./report.calculator.js";
import {
  deleteReportById,
  getReportById,
  getReports,
  insertReport,
} from "./report.repository.js";

// 기존 소비에 카테고리 합치기
function mergeExpenses(
  expenses: Expense[],
  classifications: LLMClassification[],
): ClassifiedExpense[] {
  const map = new Map(classifications.map((c) => [c.id, c]));

  return expenses.map((exp) => {
    const classification = map.get(exp.id);

    return {
      ...exp,
      category: classification?.category ?? "routine",
      reason: classification?.reason,
    };
  });
}

// 리포트 AI 생성
export async function generateReportService(payload: {
  expenses: Expense[];
  period: Period;
}) {
  const { expenses, period } = payload;

  if (!Array.isArray(expenses) || expenses.length === 0) {
    throw new AppError("expenses는 비어있지 않은 배열이어야 합니다.", 400);
  }

  if (!period) {
    throw new AppError("period가 누락되었습니다.", 400);
  }

  let classification;
  let mergedExpenses;

  try {
    classification = await requestClassification(expenses);
    mergedExpenses = mergeExpenses(expenses, classification);
  } catch (err) {
    throw new AppError(
      "현재 분석 요청이 많습니다. 잠시 후 다시 시도해주세요.",
      503,
    );
  }

  const summary = calculateSummary(expenses, classification);

  const candidates = extractCandidates(
    expenses,
    classification,
    summary.totalExpense,
  );

  const emotionScore = calculateEmotion(summary);
  const structureType = calculateStructureType(summary);
  const riskLevel = calculateRiskLevel(emotionScore.score);

  let insight;
  try {
    insight = await requestInsight({
      total: summary.totalExpense,
      fixedPercent: summary.percentage.fixed,
      routinePercent: summary.percentage.routine,
      emotionalPercent: summary.percentage.emotional,
      emotionScore: emotionScore.score,
      emotionLevel: emotionScore.level,
      candidates,
      period,
      structureType,
      riskLevel,
    });
  } catch (err) {
    throw new AppError(
      "현재 분석 요청이 많습니다. 잠시 후 다시 시도해주세요.",
      503,
    );
  }

  return {
    mergedExpenses,
    summary,
    emotionScore,
    insight,
    period,
  };
}

// 리포트 db 저장
type SaveReportInput = {
  total_price: number;
  score: number;
  type: string;
  insight: any;
  expenses: any[];
};

export async function saveReportService(data: SaveReportInput, userId: number) {
  try {
    const reportId = await insertReport({
      user_id: userId,
      ...data,
    });

    return {
      id: reportId,
    };
  } catch (err) {
    console.error(err);
    throw new AppError("리포트 저장에 실패했습니다.", 500);
  }
}

// 리포트 삭제
export async function deleteReportByIdService(id: number, user_id: number) {
  const affected = await deleteReportById(id, user_id);

  if (affected === 0) {
    throw new AppError("리포트를 찾을 수 없습니다.", 404);
  }

  return {
    success: true,
  };
}

// id 리포트 가져오기
export async function getReportByIdService(id: number, user_id: number) {
  const report = await getReportById(id, user_id);

  if (!report) {
    throw new AppError("리포트를 찾을 수 없습니다.", 404);
  }

  return {
    ...report,
    insight_json:
      typeof report.insight_json === "string"
        ? JSON.parse(report.insight_json)
        : report.insight_json,
    expenses_json:
      typeof report.expenses_json === "string"
        ? JSON.parse(report.expenses_json)
        : report.expenses_json,
  };
}

type GetReportsParams = {
  user_id: number;
  page: number;
  limit: number;
  sortBy: string;
  order: string;
  type?: string;
};

// 리포트 목록 불러오기
export async function getReportsService(params: GetReportsParams) {
  const { user_id, page, limit, sortBy, order, type } = params;

  const offset = (page - 1) * limit;

  const { rows, total } = await getReports({
    user_id,
    offset,
    limit,
    sortBy,
    order,
    type,
  });

  return {
    data: rows,

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
