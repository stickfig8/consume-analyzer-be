// 소비 데이터 타입
export type Expense = {
  id: string;
  item: string;
  price: number;
  memo?: string;
};

// 기간 타입
export type Period = "monthly" | "weekly" | "daily";

// 후보 타입
export type ImproveCandidate = {
  impact: number;
  adjustScore: number;
  item: string;
  total: number;
  category: string;
};

// 소비 구조 타입
export type StructureType =
  | "감정 우세형"
  | "구조 안정형"
  | "루틴 주도형"
  | "관리 안정형"
  | "균형형";

// 리스크 단계 타입
export type RiskLevel = "안정 단계" | "주의 단계" | "경계 단계" | "위험 단계";

// 리포트 생성 페이로드 타입
export type InsightPayload = {
  total: number;
  fixedPercent: number;
  routinePercent: number;
  emotionalPercent: number;
  emotionScore: number;
  emotionLevel: string;
  candidates: ImproveCandidate[];
  period: Period;
  structureType: StructureType;
  riskLevel: RiskLevel;
};

// 소비 요약(비율, 금액, 총액) 타입
export type ExpenseSummary = {
  totalExpense: number;

  prices: {
    fixed: number;
    routine: number;
    emotional: number;
  };

  percentage: {
    fixed: number;
    routine: number;
    emotional: number;
  };
};

// 소비 성향 타입
export type ExpenseCategory = "fixed" | "routine" | "emotional";

// 소비 분류 타입
export type LLMClassification = {
  id: string;
  category: ExpenseCategory;
  reason?: string;
};

// 소비데이터 + 분류
export type ClassifiedExpense = {
  id: string;
  item: string;
  price: number;
  memo?: string;
  category: ExpenseCategory;
  reason?: string;
};

// 리포트 타입
export type LLMInsight = {
  // 전체 요약 문장
  summaryComment: string;

  // 소비 패턴 해석 리스트
  patternAnalysis: string[];

  // 개선 제안 리스트
  improvementSuggestions: string[];

  // 개선 항목 리스트
  selectedCandidates: string[];

  // 리스크 전망
  expectedRisks: string[];
};

// 감정 소비 단계 타입
export type EmotionLevel =
  | "low"
  | "mediumLow"
  | "medium"
  | "mediumHigh"
  | "high";

// 감정 소비 점수 타입
export type EmotionScore = {
  score: number; // 0 ~ 100
  level: EmotionLevel;
};
