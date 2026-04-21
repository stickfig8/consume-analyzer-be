import { z } from "zod";

export const ExpenseSchema = z.object({
  id: z.string(),
  item: z.string(),
  price: z.number(),
  memo: z.string().optional(),

  category: z.enum(["fixed", "routine", "emotional"]),
});

export const InsightSchema = z.object({
  summaryComment: z.string(),

  patternAnalysis: z.array(z.string()),

  improvementSuggestions: z.array(z.string()),

  selectedCandidates: z.array(z.string()),

  expectedRisks: z.array(z.string()),
});

export const SaveReportSchema = z.object({
  total_price: z.number().min(1),

  score: z.number().min(0).max(100),

  type: z.enum(["monthly", "weekly", "daily"]),

  insight: InsightSchema,

  expenses: z.array(ExpenseSchema).min(1),
});
