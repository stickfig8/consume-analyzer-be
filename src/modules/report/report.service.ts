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
import { insertReport } from "./report.repository.js";

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
