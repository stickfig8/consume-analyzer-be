import type {
  EmotionLevel,
  EmotionScore,
  Expense,
  ExpenseSummary,
  ImproveCandidate,
  LLMClassification,
  RiskLevel,
  StructureType,
} from "../../types/types.js";
import { categoryWeight } from "./report.configs.js";

// 비율 및 총액 반환
export function calculateSummary(
  expenses: Expense[],
  classificationResult: LLMClassification[],
): ExpenseSummary {
  const categoryPrices = {
    fixed: 0,
    routine: 0,
    emotional: 0,
  };

  classificationResult.forEach((item) => {
    const expense = expenses.find((expense) => expense.id === item.id);
    if (!expense) return;

    categoryPrices[item.category] += expense.price;
  });

  const total =
    categoryPrices.fixed + categoryPrices.routine + categoryPrices.emotional;

  const percentage = {
    fixed: total ? Math.round((categoryPrices.fixed / total) * 100) : 0,
    routine: total ? Math.round((categoryPrices.routine / total) * 100) : 0,
    emotional: total ? Math.round((categoryPrices.emotional / total) * 100) : 0,
  };

  return {
    totalExpense: total,
    prices: categoryPrices,
    percentage,
  };
}

// 개선 후보 추출
export function extractCandidates(
  expenses: Expense[],
  classification: LLMClassification[],
  totalExpense: number,
): ImproveCandidate[] {
  // 소비에 classification추가
  const merged = expenses.map((expense) => ({
    ...expense,
    category: classification.find((item) => item.id === expense.id)?.category,
  }));

  // item 기준 정렬
  const grouped: Record<
    string,
    { item: string; total: number; category: string }
  > = {};

  merged.forEach((expense) => {
    if (!grouped[expense.item]) {
      grouped[expense.item] = {
        item: expense.item,
        total: 0,

        category: expense.category!,
      };
    }

    grouped[expense.item].total += expense.price;
  });

  // 비율 기반 점수 계산
  const candidates = Object.values(grouped).map((item) => {
    const weight =
      categoryWeight[item.category as keyof typeof categoryWeight] ?? 0.5;

    const impact = item.total / totalExpense;

    return {
      ...item,
      impact,
      adjustScore: impact / weight,
    };
  });

  // 상위 4개 추출
  return candidates.sort((a, b) => b.adjustScore - a.adjustScore).slice(0, 4);
}
// 감정 단계 계산
export function getEmotionLevelByScore(score: number): EmotionLevel {
  if (score < 20) return "low";
  else if (score < 40) return "mediumLow";
  else if (score < 60) return "medium";
  else if (score < 80) return "mediumHigh";
  else return "high";
}

// 감정 소비 점수 추출
export function calculateEmotion(summary: ExpenseSummary): EmotionScore {
  const emotional = summary.percentage.emotional;

  const normalized = Math.min(emotional / 50, 1);

  let baseScore = Math.pow(normalized, 2) * 100;

  if (emotional > summary.percentage.routine) {
    baseScore *= 1.1;
  }

  if (emotional > summary.percentage.fixed) {
    baseScore *= 1.15;
  }

  const score = Math.min(100, Math.round(baseScore));

  const level = getEmotionLevelByScore(score);

  return {
    score,
    level,
  };
}

// 소비 구조 반환
export function calculateStructureType(summary: ExpenseSummary): StructureType {
  const { fixed, routine, emotional } = summary.percentage;

  if (emotional >= 45) {
    return "감정 우세형";
  }

  if (fixed >= 65) {
    return "구조 안정형";
  }

  if (routine >= 45) {
    return "루틴 주도형";
  }

  if (emotional <= 15) {
    return "관리 안정형";
  }

  return "균형형";
}

// 리스크 단계 반환
export function calculateRiskLevel(score: number): RiskLevel {
  if (score < 30) return "안정 단계";
  if (score < 60) return "주의 단계";
  if (score < 80) return "경계 단계";
  return "위험 단계";
}
